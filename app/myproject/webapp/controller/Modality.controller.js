sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("myproject.controller.Modality", {

        onInit() {},

        onNavBack() {
            this.getOwnerComponent().getRouter().navTo("RouteHome");
        },

        onFilter() {
            const oBinding = this.byId("modalityGroupList").getBinding("items");
            const aFilters = [];

            // Modality Group filter
            const sGroupKey = this.byId("groupFilter").getSelectedKey();
            if (sGroupKey) {
                aFilters.push(new Filter("modalityGroupID", FilterOperator.EQ, sGroupKey));
            }

            // Modality filter — any child modality matches the selected ID
            const sModalityKey = this.byId("modalityFilter").getSelectedKey();
            if (sModalityKey) {
                aFilters.push(new Filter({
                    path: "modalities",
                    operator: FilterOperator.Any,
                    variable: "item",
                    condition: new Filter("item/modalityID", FilterOperator.EQ, sModalityKey)
                }));
            }

            // First Threshold Volume — minimum value
            const sFirst = this.byId("firstThresholdFilter").getSelectedKey();
            if (sFirst) {
                aFilters.push(new Filter("firstThresholdVolume", FilterOperator.GE, parseFloat(sFirst)));
            }

            // Second Threshold Volume — minimum value
            const sSecond = this.byId("secondThresholdFilter").getSelectedKey();
            if (sSecond) {
                aFilters.push(new Filter("secondThresholdVolume", FilterOperator.GE, parseFloat(sSecond)));
            }

            // Applied Discount for First Threshold — minimum %
            const sFirstDiscount = this.byId("firstDiscountFilter").getSelectedKey();
            if (sFirstDiscount) {
                aFilters.push(new Filter("appliedDiscountForFirstThreshold", FilterOperator.GE, parseFloat(sFirstDiscount)));
            }

            // Applied Discount for Second Threshold — minimum %
            const sSecondDiscount = this.byId("secondDiscountFilter").getSelectedKey();
            if (sSecondDiscount) {
                aFilters.push(new Filter("appliedDiscountForSecondThreshold", FilterOperator.GE, parseFloat(sSecondDiscount)));
            }

            oBinding.filter(aFilters.length ? new Filter({ filters: aFilters, and: true }) : []);
        },

        onResetFilters() {
            this.byId("groupFilter").setSelectedKey("");
            this.byId("modalityFilter").setSelectedKey("");
            this.byId("firstThresholdFilter").setSelectedKey("");
            this.byId("secondThresholdFilter").setSelectedKey("");
            this.byId("firstDiscountFilter").setSelectedKey("");
            this.byId("secondDiscountFilter").setSelectedKey("");
            this.byId("modalityGroupList").getBinding("items").filter([]);
        }
    });
});
