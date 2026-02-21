"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionMediaSchema = exports.QuestionMedia = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let QuestionMedia = class QuestionMedia extends mongoose_2.Document {
    questionId;
    imageData;
    mimeType;
    originalName;
    size;
};
exports.QuestionMedia = QuestionMedia;
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], QuestionMedia.prototype, "questionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], QuestionMedia.prototype, "imageData", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], QuestionMedia.prototype, "mimeType", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], QuestionMedia.prototype, "originalName", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], QuestionMedia.prototype, "size", void 0);
exports.QuestionMedia = QuestionMedia = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], QuestionMedia);
exports.QuestionMediaSchema = mongoose_1.SchemaFactory.createForClass(QuestionMedia);
exports.QuestionMediaSchema.index({ questionId: 1 });
//# sourceMappingURL=question-media.schema.js.map