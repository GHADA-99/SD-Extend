namespace db;

using {managed} from '@sap/cds/common';

entity Cases : managed {

    key examCode : String(6);
    descriptionInEnglish : String(80);
    descriptionInArabic : String(80);
    priceWithoutTax : Price;
    creationData : Date;
    modalityID : String(6);
    modalityGroup : String(6);

}

type Price : Decimal;

entity ModalityGroup : managed {

    key modalityGroupID : String(6);
    modalityGroupDescription : String(80);
    firstThresholdVolume : Decimal;
    secondThresholdVolume : Decimal;
    appliedDiscountForFirstThreshold : Decimal;
    appliedDiscountForSecondThreshold : Decimal;
    //Associate with children
    modalities : Composition of many modalities
                on modalities.modalityGroup = $self;
}

entity modalities {
    key modalityID : String(6);
    modalityDescription : String(80);
    modalityGroup : Association to ModalityGroup;
}

entity collective : managed{
    key examCode : String(6);
    descriptionInEnglish : String(80);
    descriptionInArabic : String(80);
    priceWithoutTax : Price;
    creationData : Date;
    modalityID : String(6);
    modalityGroup : String(6);
    totalQtyPerModality : Integer;
}