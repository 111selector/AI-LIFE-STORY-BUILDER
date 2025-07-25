import JSZip from 'jszip';
import { Story, User } from '../types';
import { translations } from '../i18n/translations';

type TFunction = (key: keyof typeof translations.en, replacements?: Record<string, string | number>) => string;

const base64ToBlob = async (base64: string): Promise<Blob> => {
    const response = await fetch(base64);
    const blob = await response.blob();
    return blob;
};

export const downloadVideoPackage = async (story: Story, user: User, t: TFunction): Promise<void> => {
    const zip = new JSZip();

    // 1. Add story text
    const storyText = story.segments.map(s => s.paragraph).join('\n\n');
    zip.file("story.txt", storyText);

    // 2. Add metadata
    const metadata = {
        title: story.title,
        protagonist: story.protagonist,
        setting: story.setting,
        createdBy: user.name,
        createdAt: story.createdAt,
        isComplete: story.isComplete,
        segmentCount: story.segments.length,
    };
    zip.file("metadata.json", JSON.stringify(metadata, null, 2));
    
    // 3. Add images
    const imageFolder = zip.folder("images");
    if (imageFolder) {
        const imagePromises = story.segments.map(async (segment, index) => {
            if (segment.generatedImageUrl && segment.generatedImageUrl.startsWith('data:image')) {
                try {
                    const blob = await base64ToBlob(segment.generatedImageUrl);
                    const fileExtension = blob.type.split('/')[1] || 'jpeg';
                    imageFolder.file(`image_${String(index + 1).padStart(2, '0')}.${fileExtension}`, blob);
                } catch (error) {
                    console.error(`Could not process image for segment ${index + 1}:`, error);
                }
            }
        });
        await Promise.all(imagePromises);
    }

    // 4. Add a README
    const readmeContent = t('video_package_readme_title') + '\n\n' + t('video_package_readme_content');
    zip.file("README.txt", readmeContent);

    // 5. Generate and download zip
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${story.title.replace(/ /g, '_')}_video_package.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
