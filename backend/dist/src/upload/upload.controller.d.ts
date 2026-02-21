export declare class UploadController {
    uploadImage(file: Express.Multer.File): {
        url: string;
        originalName: string;
        size: number;
        mimetype: string;
    };
}
