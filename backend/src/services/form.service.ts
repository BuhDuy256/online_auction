import * as formRepository from "../repositories/form.repository";

export const getProductSchema = async () => {
    const { parentOptions, dataMap } = await formRepository.getCategoriesForSchema();

    const schema = {
        type: "object",
        required: [
            "name",
            "parent_category_id",
            "category_id",
            "thumbnail",
            "images",
            "start_price",
            "step_price",
            "description",
            "end_time",
            "auto_extend"
        ],
        properties: {
            name: {
                type: "string",
                title: "Product Name",
                maxLength: 500
            },
            parent_category_id: {
                type: "integer",
                title: "Parent Category",
                oneOf: parentOptions
            },
            category_id: {
                type: "integer",
                title: "Category"
            },
            thumbnail: {
                type: "string",
                title: "Thumbnail Image",
                format: "data-url"
            },
            images: {
                type: "array",
                title: "Additional Images",
                minItems: 2,
                items: {
                    type: "string",
                    format: "data-url"
                }
            },
            start_price: {
                type: "number",
                title: "Starting Price",
                minimum: 0
            },
            step_price: {
                type: "number",
                title: "Bid Step",
                minimum: 0
            },
            buy_now_price: {
                type: "number",
                title: "Buy Now Price",
                minimum: 0
            },
            description: {
                type: "string",
                title: "Product Description"
            },
            end_time: {
                type: "string",
                title: "End Time",
                format: "date-time"
            },
            auto_extend: {
                type: "string",
                title: "Auto Extend",
                enum: ["yes", "no"],
                default: "no"
            }
        }
    };

    const uiSchema = {
        name: {
            "ui:placeholder": "Enter product name"
        },
        parent_category_id: {
            "ui:widget": "select"
        },
        category_id: {
            "ui:widget": "select",
            "ui:options": {
                dataMap
            }
        },
        thumbnail: {
            "ui:options": {
                accept: "image/*"
            }
        },
        images: {
            "ui:options": {
                accept: "image/*"
            }
        },
        start_price: {
            "ui:placeholder": "Enter starting price"
        },
        step_price: {
            "ui:placeholder": "Enter bid step"
        },
        buy_now_price: {
            "ui:placeholder": "Enter buy now price (optional)"
        },
        description: {
            "ui:widget": "textarea",
            "ui:options": {
                rows: 10
            }
        },
        end_time: {
            "ui:widget": "alt-datetime"
        },
        auto_extend: {
            "ui:widget": "radio"
        }
    };

    return {
        schema,
        uiSchema,
        dataMap
    };
};