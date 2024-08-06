import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsImageFile(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isImageFile',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const file = value as Express.Multer.File;
                    if (!file) return false;

                    const allowedMimeTypes = ['image/jpeg', 'image/png'];
                    return allowedMimeTypes.includes(file.mimetype);
                },
                defaultMessage(args: ValidationArguments) {
                    return 'File must be a valid image (jpeg, png, gif).';
                },
            },
        });
    };
}

export function IsFileSize(maxSize: number, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isFileSize',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const file = value as Express.Multer.File;
                    if (!file) return false;

                    // Check if the file size is within the limit
                    return file.size <= maxSize;
                },
                defaultMessage(args: ValidationArguments) {
                    return `File size should not exceed ${args.constraints[0]} bytes.`;
                },
            },
        });
    };
}
