export declare enum BulkOperationType {
    DELETE = "DELETE",
    ARCHIVE = "ARCHIVE",
    UNARCHIVE = "UNARCHIVE",
    ACTIVATE = "ACTIVATE",
    DEACTIVATE = "DEACTIVATE"
}
export declare class BulkOperationDto {
    quizIds: string[];
    operation: BulkOperationType;
}
