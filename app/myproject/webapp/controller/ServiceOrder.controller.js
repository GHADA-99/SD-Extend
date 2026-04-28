sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("myproject.controller.ServiceOrder", {

        onInit() {
            this.getOwnerComponent().getRouter()
                .getRoute("RouteServiceOrder")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched() {
            const oBinding = this.byId("soTable").getBinding("items");
            if (oBinding) {
                oBinding.refresh();
            }
        },

        onNavBack() {
            this.getOwnerComponent().getRouter().navTo("RouteHome");
        },

        onCreateNew() {
            this.getOwnerComponent().getRouter().navTo("RouteCollectiveCreate");
        },

        onFilter() {
            const oBinding = this.byId("soTable").getBinding("items");
            const aFilters = [];

            const sStatus = this.byId("soStatusCombo").getSelectedKey();
            if (sStatus) {
                aFilters.push(new Filter("status", FilterOperator.EQ, sStatus));
            }

            const oDate = this.byId("soDateInput").getDateValue();
            if (oDate) {
                const sDate = [
                    oDate.getFullYear(),
                    String(oDate.getMonth() + 1).padStart(2, "0"),
                    String(oDate.getDate()).padStart(2, "0")
                ].join("-");
                aFilters.push(new Filter("orderDate", FilterOperator.EQ, sDate));
            }

            const sERPID = this.byId("soERPIDInput").getValue().trim();
            if (sERPID) {
                aFilters.push(new Filter("serviceOrderERPID", FilterOperator.Contains, sERPID));
            }

            const sFinished = this.byId("soFinishedCombo").getSelectedKey();
            if (sFinished !== "") {
                aFilters.push(new Filter("finished", FilterOperator.EQ, sFinished === "true"));
            }

            oBinding.filter(aFilters.length ? new Filter({ filters: aFilters, and: true }) : []);
        },

        onRowPress(oEvent) {
            const oCtx = oEvent.getSource().getBindingContext();
            const sExamCode = oCtx.getProperty("collective_examCode");
            this.getOwnerComponent().getRouter().navTo("RouteCollective", { examCode: sExamCode });
        },

        onResetFilters() {
            this.byId("soStatusCombo").setSelectedKey("");
            this.byId("soDateInput").setValue("");
            this.byId("soERPIDInput").setValue("");
            this.byId("soFinishedCombo").setSelectedKey("");
            this.byId("soTable").getBinding("items").filter([]);
        },

        formatStatusState(sStatus) {
            return sStatus === "Confirmed" ? "Success" : "Warning";
        },

        formatFinishedText(bFinished) {
            return bFinished ? "Yes" : "No";
        },

        formatFinishedState(bFinished) {
            return bFinished ? "Success" : "None";
        }
    });
});
