sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("myproject.controller.Cases", {

        onInit() {},

        onNavBack() {
            this.getOwnerComponent().getRouter().navTo("RouteHome");
        },

        onFilter() {
            const oBinding = this.byId("casesTable").getBinding("items");
            const aFilters = [];

            // Exam Code — contains search
            const sExamCode = this.byId("examCodeFilter").getValue().trim();
            if (sExamCode) {
                aFilters.push(new Filter("examCode", FilterOperator.Contains, sExamCode));
            }

            // Modality ID — exact match
            const sModalityID = this.byId("modalityIDFilter").getSelectedKey();
            if (sModalityID) {
                aFilters.push(new Filter("modalityID", FilterOperator.EQ, sModalityID));
            }

            // Modality Group — exact match
            const sGroup = this.byId("modalityGroupFilter").getSelectedKey();
            if (sGroup) {
                aFilters.push(new Filter("modalityGroup", FilterOperator.EQ, sGroup));
            }

            // Creation Date — exact day match (Edm.Date: yyyy-MM-dd)
            const oDate = this.byId("dateFilter").getDateValue();
            if (oDate) {
                const sDate = [
                    oDate.getFullYear(),
                    String(oDate.getMonth() + 1).padStart(2, "0"),
                    String(oDate.getDate()).padStart(2, "0")
                ].join("-");
                aFilters.push(new Filter("creationData", FilterOperator.EQ, sDate));
            }

            oBinding.filter(aFilters.length ? new Filter({ filters: aFilters, and: true }) : []);
        },

        onResetFilters() {
            this.byId("examCodeFilter").setValue("");
            this.byId("modalityIDFilter").setSelectedKey("");
            this.byId("modalityGroupFilter").setSelectedKey("");
            this.byId("dateFilter").setValue("");
            this.byId("casesTable").getBinding("items").filter([]);
        }
    });
});
