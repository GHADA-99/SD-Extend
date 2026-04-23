sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Theming"
], (Controller, JSONModel, Theming) => {
    "use strict";

    const LIGHT = "sap_horizon";
    const DARK  = "sap_horizon_dark";

    const ROUTES = {
        cases:         "RouteCases",
        modalities:    "RouteModality",
        serviceOrders: "RouteServiceOrder"
    };

    return Controller.extend("myproject.controller.Dashboard", {

        onInit() {
            this.getView().setModel(new JSONModel({
                themeIcon:    "sap-icon://light-mode",
                themeTooltip: "Switch to Light Mode"
            }), "ui");
        },

        onToggleSidebar() {
            const oToolPage = this.byId("toolPage");
            oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
        },

        onToggleTheme() {
            const oModel  = this.getView().getModel("ui");
            const bIsDark = Theming.getTheme() === DARK;
            Theming.setTheme(bIsDark ? LIGHT : DARK);
            oModel.setProperty("/themeIcon",    bIsDark ? "sap-icon://dark-mode"  : "sap-icon://light-mode");
            oModel.setProperty("/themeTooltip", bIsDark ? "Switch to Dark Mode"   : "Switch to Light Mode");
        },

        onNavItemSelect(oEvent) {
            const sKey   = oEvent.getParameter("item").getKey();
            const sRoute = ROUTES[sKey];
            if (sRoute) {
                this.getOwnerComponent().getRouter().navTo(sRoute);
            }
        }
    });
});
