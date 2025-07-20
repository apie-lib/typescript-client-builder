import { createForApi } from './index';
const apiUrl = "https:\/\/apie-lib.blogspot.com\/";
const resourceDefinition = {
    "default": [
        {
            "type": "createEntity",
            "name": "UserWithAddress"
        },
        {
            "type": "createProperty",
            "entityName": "UserWithAddress",
            "propertyName": "id",
            "writableOnCreation": true,
            "writableOnModification": false,
            "readable": true
        },
        {
            "type": "createProperty",
            "entityName": "UserWithAddress",
            "propertyName": "password",
            "writableOnCreation": true,
            "writableOnModification": true,
            "readable": false
        },
        {
            "type": "createProperty",
            "entityName": "UserWithAddress",
            "propertyName": "address",
            "writableOnCreation": true,
            "writableOnModification": false,
            "readable": true
        },
        {
            "type": "createEntity",
            "name": "Order"
        },
        {
            "type": "createProperty",
            "entityName": "Order",
            "propertyName": "id",
            "writableOnCreation": true,
            "writableOnModification": false,
            "readable": true
        },
        {
            "type": "createProperty",
            "entityName": "Order",
            "propertyName": "orderLines",
            "writableOnCreation": true,
            "writableOnModification": false,
            "readable": true
        },
        {
            "type": "createProperty",
            "entityName": "Order",
            "propertyName": "orderStatus",
            "writableOnCreation": false,
            "writableOnModification": false,
            "readable": true
        }
    ],
    "other": [
        {
            "type": "createEntity",
            "name": "UserWithAutoincrementKey"
        },
        {
            "type": "createProperty",
            "entityName": "UserWithAutoincrementKey",
            "propertyName": "password",
            "writableOnCreation": true,
            "writableOnModification": true,
            "readable": true
        },
        {
            "type": "createProperty",
            "entityName": "UserWithAutoincrementKey",
            "propertyName": "address",
            "writableOnCreation": true,
            "writableOnModification": false,
            "readable": true
        },
        {
            "type": "createProperty",
            "entityName": "UserWithAutoincrementKey",
            "propertyName": "id",
            "writableOnCreation": false,
            "writableOnModification": false,
            "readable": true
        },
        {
            "type": "createEntity",
            "name": "Animal"
        },
        {
            "type": "createProperty",
            "entityName": "Animal",
            "propertyName": "animalType",
            "writableOnCreation": true,
            "writableOnModification": false,
            "readable": true
        },
        {
            "type": "createProperty",
            "entityName": "Animal",
            "propertyName": "id",
            "writableOnCreation": true,
            "writableOnModification": false,
            "readable": true
        },
        {
            "type": "createProperty",
            "entityName": "Animal",
            "propertyName": "hasMilk",
            "writableOnCreation": true,
            "writableOnModification": true,
            "readable": true
        },
        {
            "type": "createProperty",
            "entityName": "Animal",
            "propertyName": "starving",
            "writableOnCreation": true,
            "writableOnModification": true,
            "readable": true
        },
        {
            "type": "createProperty",
            "entityName": "Animal",
            "propertyName": "poisonous",
            "writableOnCreation": true,
            "writableOnModification": true,
            "readable": true
        }
    ]
};
export const ApieLayer = createForApi(apiUrl, resourceDefinition);
