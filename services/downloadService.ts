import { jsPDF } from 'jspdf';
import { Story, User, SubscriptionTier } from '../types';
import { APP_NAME } from '../constants';
import { translations } from '../i18n/translations';

type TFunction = (key: keyof typeof translations.en, replacements?: Record<string, string | number>) => string;

const generateLicenseNotice = (story: Story, user: User, t: TFunction): string => {
    if (user.subscriptionTier !== SubscriptionTier.PRO && user.subscriptionTier !== SubscriptionTier.PREMIUM) {
        return t('dl_license_notice_personal');
    }

    return `
${t('dl_license_commercial_title')}

${t('dl_title')}: ${story.title}
${t('dl_license_created_by')}: ${user.name}
${t('dl_license_generated_using')}: ${APP_NAME} (Powered by AI Life Story Builder)
${t('dl_license_id')}: LIC-STORY-${story.id}-${user.id}

${t('dl_license_usage_rights')}
${t('dl_license_usage_rights_desc')}

${t('dl_license_includes')}
${t('dl_license_includes_1')}
${t('dl_license_includes_2')}
${t('dl_license_includes_3')}

${t('dl_license_disclaimer')}
    `.trim();
}

const formatStoryAsText = (story: Story, licenseText: string, t: TFunction): string => {
    let content = `${t('dl_title')}: ${story.title}\n`;
    content += `${t('dl_by')}: ${story.protagonist}\n`;
    content += `${t('dl_setting')}: ${story.setting}\n`;
    content += `----------------------------------------\n\n`;

    story.segments.forEach((segment) => {
        content += `${segment.paragraph}\n\n`;
        if (segment.chosenPath) {
            content += `> ${t('dl_chosen_path')}: ${segment.chosenPath}\n\n`;
        }
    });

    if (story.isComplete && story.summary) {
        content += `----------------------------------------\n`;
        content += `${t('dl_summary')}:\n${story.summary}\n`;
    }
    
    content += `\n----------------------------------------\n${licenseText}`;

    return content;
};


export const downloadTxt = (story: Story, user: User, t: TFunction) => {
    const licenseText = generateLicenseNotice(story, user, t);
    const textContent = formatStoryAsText(story, licenseText, t);
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${story.title.replace(/ /g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};


export const downloadPdf = (story: Story, user: User, t: TFunction) => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    let y = margin;

    const addText = (text: string, size: number, style: 'bold' | 'normal' | 'italic', maxWidth: number) => {
        doc.setFontSize(size);
        doc.setFont('helvetica', style);
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line: string) => {
            if (y > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
            doc.text(line, margin, y);
            y += (size * 0.5);
        });
        y += 5; // Spacing after block
    };

    // Title
    addText(story.title, 22, 'bold', 180);
    y += 5;

    // Story Body
    story.segments.forEach(segment => {
        addText(segment.paragraph, 12, 'normal', 180);
        if (segment.chosenPath) {
            addText(`> ${t('dl_chosen_path')}: ${segment.chosenPath}`, 10, 'italic', 180);
        }
    });

    // Summary
    if (story.isComplete && story.summary) {
        addText(t('dl_summary'), 16, 'bold', 180);
        addText(story.summary, 12, 'normal', 180);
    }
    
    // License Page
    doc.addPage();
    y = margin;
    const licenseText = generateLicenseNotice(story, user, t);
    addText(licenseText, 10, 'normal', 180);

    // Watermark for Pro/Premium
    if (user.subscriptionTier === SubscriptionTier.PRO || user.subscriptionTier === SubscriptionTier.PREMIUM) {
        for (let i = 1; i <= doc.getNumberOfPages(); i++) {
            doc.setPage(i);
            doc.setFontSize(50);
            doc.setTextColor(220, 220, 220);
            doc.text(t('dl_watermark'), doc.internal.pageSize.width / 2, doc.internal.pageSize.height / 2, {
                angle: 45,
                align: 'center'
            });
             doc.setTextColor(0, 0, 0);
        }
    }

    doc.save(`${story.title.replace(/ /g, '_')}.pdf`);
};