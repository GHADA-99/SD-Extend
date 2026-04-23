using db as my from '../db/schema';

service CasesCollective {

    entity Cases                as projection on my.Cases;
    entity Modalities           as projection on my.modalities;
    entity ModalityGroups       as projection on my.ModalityGroup;
    entity Collective           as projection on my.collective;

}