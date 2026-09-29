import { createForApi } from "./contents/es6/index";
import type { BoundedContext, Entity } from "./contents/es6/build-script";
type apieFixturesIdentifiersUserWithAddressIdentifier = string;
type apieFixturesValueObjectsPassword = string;
type apieFixturesIdentifiersUserWithAddressIdentifierResult = string;
type apieFixturesIdentifiersOrderIdentifier = string;
type apieFixturesIdentifiersOrderIdentifierResult = string;
type apieFixturesEnumsOrderStatusResult = "DRAFT" | "ACCEPTED" | "COMPLETED";
type apieFixturesIdentifiersUserAutoincrementIdentifierResult = number;
type apieFixturesValueObjectsPasswordResult = string;
type __string = string;
type apieFixturesEntitiesPolymorphicAnimalIdentifier = string;
type bool = true | false;
type stringResult = string;
type apieFixturesEntitiesPolymorphicAnimalIdentifierResult = string;
type boolResult = true | false;
type apieCoreValueObjectsDatabaseText = string;
type apieCoreValueObjectsDatabaseTextResult = string;
type apieFixturesIdentifiersOrderLineIdentifier = string;
type apieCoreValueObjectsPrice = string;
type apieFixturesIdentifiersOrderLineIdentifierResult = string;
type apieCoreValueObjectsPriceResult = string;
const apiUrl: string = "https://apie-lib.blogspot.com/";
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
type UserWithAddressModify = {
    password?: apieFixturesValueObjectsPassword;
};
type UserWithAutoincrementKeyModify = {
    password?: apieFixturesValueObjectsPassword;
};
type Animal = {
    animalType: __string;
    id?: apieFixturesEntitiesPolymorphicAnimalIdentifier | null;
    hasMilk?: bool;
    starving?: bool;
    poisonous?: bool;
};
type AnimalResult = {
    animalType: stringResult;
    id: apieFixturesEntitiesPolymorphicAnimalIdentifierResult;
    hasMilk?: boolResult;
    starving?: boolResult;
    poisonous?: boolResult;
};
type AnimalModify = {
    hasMilk?: bool;
    starving?: bool;
    poisonous?: bool;
};
type apieFixturesValueObjectsAddressWithZipcodeCheck = {
    street: apieCoreValueObjectsDatabaseText;
    streetNumber: apieCoreValueObjectsDatabaseText;
    zipcode: apieCoreValueObjectsDatabaseText;
    city: apieCoreValueObjectsDatabaseText;
};
type apieFixturesValueObjectsAddressWithZipcodeCheckResult = {
    street: apieCoreValueObjectsDatabaseTextResult;
    streetNumber: apieCoreValueObjectsDatabaseTextResult;
    zipcode: apieCoreValueObjectsDatabaseTextResult;
    city: apieCoreValueObjectsDatabaseTextResult;
};
type apieCoreListsStringSet = __string[];
type apieCoreListsStringSetResult = stringResult[];
type OrderLine = {
    id: apieFixturesIdentifiersOrderLineIdentifier;
    price: apieCoreValueObjectsPrice;
};
type OrderLineResult = {
    id: apieFixturesIdentifiersOrderLineIdentifierResult;
    price: apieCoreValueObjectsPriceResult;
};
type ApieDefinitionBoundedContextOtherAnimal = Animal | AnimalModify | AnimalResult;
type UserWithAddress = {
    id?: apieFixturesIdentifiersUserWithAddressIdentifier | null;
    password?: apieFixturesValueObjectsPassword;
    address: apieFixturesValueObjectsAddressWithZipcodeCheck;
};
type UserWithAddressResult = {
    id: apieFixturesIdentifiersUserWithAddressIdentifierResult;
    address: apieFixturesValueObjectsAddressWithZipcodeCheckResult;
};
type OrderModify = {
    optionalTags?: apieCoreListsStringSet | null;
};
type UserWithAutoincrementKey = {
    password?: apieFixturesValueObjectsPassword;
    address: apieFixturesValueObjectsAddressWithZipcodeCheck;
};
type UserWithAutoincrementKeyResult = {
    id: apieFixturesIdentifiersUserAutoincrementIdentifierResult;
    address: apieFixturesValueObjectsAddressWithZipcodeCheckResult;
    password: apieFixturesValueObjectsPasswordResult | null;
};
type apieFixturesListsOrderLineList = OrderLine[];
type apieFixturesListsOrderLineListResult = OrderLineResult[];
type ApieDefinitionBoundedContextDefaultUserWithAddress = UserWithAddress | UserWithAddressModify | UserWithAddressResult;
type ApieDefinitionBoundedContextOtherUserWithAutoincrementKey = UserWithAutoincrementKey | UserWithAutoincrementKeyModify | UserWithAutoincrementKeyResult;
interface ApieDefinitionBoundedContextOther extends BoundedContext {
    entities: {
        UserWithAutoincrementKey: ApieDefinitionBoundedContextOtherUserWithAutoincrementKey;
        Animal: ApieDefinitionBoundedContextOtherAnimal;
    };
    persist: (entity: Entity) => Promise<Entity>;
    "delete": (entity: Entity) => Promise<Entity>;
}
type Order = {
    id: apieFixturesIdentifiersOrderIdentifier;
    optionalTags?: apieCoreListsStringSet | null;
    orderLines: apieFixturesListsOrderLineList;
};
type OrderResult = {
    id: apieFixturesIdentifiersOrderIdentifierResult;
    orderStatus: apieFixturesEnumsOrderStatusResult;
    optionalTags?: apieCoreListsStringSetResult | null;
    orderLines: apieFixturesListsOrderLineListResult;
};
type ApieDefinitionBoundedContextDefaultOrder = Order | OrderModify | OrderResult;
interface ApieDefinitionBoundedContextDefault extends BoundedContext {
    entities: {
        UserWithAddress: ApieDefinitionBoundedContextDefaultUserWithAddress;
        Order: ApieDefinitionBoundedContextDefaultOrder;
    };
    persist: (entity: Entity) => Promise<Entity>;
    "delete": (entity: Entity) => Promise<Entity>;
}
interface ApieDefinitionBoundedContextHashmap {
    "default": ApieDefinitionBoundedContextDefault;
    other: ApieDefinitionBoundedContextOther;
}
const ApieLayer: ApieDefinitionBoundedContextHashmap = createForApi(apiUrl, resourceDefinition);
export { ApieLayer }