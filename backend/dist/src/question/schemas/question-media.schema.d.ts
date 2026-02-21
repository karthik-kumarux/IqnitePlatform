import { Document } from 'mongoose';
export declare class QuestionMedia extends Document {
    questionId: string;
    imageData: string;
    mimeType: string;
    originalName: string;
    size: number;
}
export declare const QuestionMediaSchema: import("mongoose").Schema<QuestionMedia, import("mongoose").Model<QuestionMedia, any, any, any, (Document<unknown, any, QuestionMedia, any, import("mongoose").DefaultSchemaOptions> & QuestionMedia & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, QuestionMedia, any, import("mongoose").DefaultSchemaOptions> & QuestionMedia & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, QuestionMedia>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, QuestionMedia, Document<unknown, {}, QuestionMedia, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<QuestionMedia & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    questionId?: import("mongoose").SchemaDefinitionProperty<string, QuestionMedia, Document<unknown, {}, QuestionMedia, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QuestionMedia & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, QuestionMedia, Document<unknown, {}, QuestionMedia, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QuestionMedia & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    imageData?: import("mongoose").SchemaDefinitionProperty<string, QuestionMedia, Document<unknown, {}, QuestionMedia, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QuestionMedia & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    mimeType?: import("mongoose").SchemaDefinitionProperty<string, QuestionMedia, Document<unknown, {}, QuestionMedia, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QuestionMedia & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    originalName?: import("mongoose").SchemaDefinitionProperty<string, QuestionMedia, Document<unknown, {}, QuestionMedia, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QuestionMedia & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    size?: import("mongoose").SchemaDefinitionProperty<number, QuestionMedia, Document<unknown, {}, QuestionMedia, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<QuestionMedia & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, QuestionMedia>;
