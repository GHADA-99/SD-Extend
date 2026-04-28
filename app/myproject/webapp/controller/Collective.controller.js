sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, JSONModel, MessageToast, MessageBox, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("myproject.controller.Collective", {

        onInit() {
            this.getView().setModel(new JSONModel({
                grossAmount: 0,
                discountPercent: 0,
                discountAmount: 0,
                netAmount: 0,
                calculated: false
            }), "calc");

            this.getView().setModel(new JSONModel({
                items: [],
                loaded: false
            }), "cases");

            this.getView().setModel(new JSONModel({
                isCreate: false,
                pkgSelected: false
            }), "mode");

            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteCollective").attachPatternMatched(this._onRouteMatched, this);
            oRouter.getRoute("RouteCollectiveCreate").attachPatternMatched(this._onCreateMode, this);
        },

        // ── View mode: navigated from ServiceOrder row press ──────────────────
        _onRouteMatched(oEvent) {
            this._bCreateMode = false;
            this._nActualQty  = null;

            const sExamCode = oEvent.getParameter("arguments").examCode;

            this.getView().getModel("mode").setData({ isCreate: false, pkgSelected: false });
            this.getView().getModel("calc").setData({
                grossAmount: 0, discountPercent: 0, discountAmount: 0, netAmount: 0, calculated: false
            });
            this.getView().getModel("cases").setData({ items: [], loaded: false });

            this.getView().bindElement({
                path: "/Collective(examCode='" + sExamCode + "')",
                parameters: { $$updateGroupId: "collectiveGroup" }
            });
        },

        // ── Create mode: navigated from ServiceOrder "Create" button ──────────
        _onCreateMode() {
            this._bCreateMode = true;
            this._nActualQty  = null;

            this.getView().unbindElement();
            this.getView().getModel("mode").setData({ isCreate: true, pkgSelected: false });
            this.getView().getModel("calc").setData({
                grossAmount: 0, discountPercent: 0, discountAmount: 0, netAmount: 0, calculated: false
            });
            this.getView().getModel("cases").setData({ items: [], loaded: false });
        },

        onNavBack() {
            this.getOwnerComponent().getRouter().navTo("RouteServiceOrder");
        },

        // ── Get Cases: load April 2026 cases grouped by modalityID ────────────
        async onGetCases() {
            const oView = this.getView();
            const oModel = oView.getModel();

            try {
                const oBinding = oModel.bindList("/Cases", null, null, [
                    new Filter({
                        filters: [
                            new Filter("creationData", FilterOperator.GE, "2026-04-01"),
                            new Filter("creationData", FilterOperator.LE, "2026-04-30")
                        ],
                        and: true
                    })
                ]);

                const aContexts = await oBinding.requestContexts(0, 200);

                const mGrouped = {};
                aContexts.forEach(ctx => {
                    const obj = ctx.getObject();
                    if (!mGrouped[obj.modalityID]) {
                        mGrouped[obj.modalityID] = { count: 0, priceWithoutTax: obj.priceWithoutTax, modalityGroup: obj.modalityGroup };
                    }
                    mGrouped[obj.modalityID].count += 1;
                });

                const aItems = Object.entries(mGrouped)
                    .map(([modalityID, data]) => ({ modalityID, totalQty: data.count, priceWithoutTax: data.priceWithoutTax, modalityGroup: data.modalityGroup }))
                    .sort((a, b) => a.modalityID.localeCompare(b.modalityID));

                oView.getModel("cases").setData({ items: aItems, loaded: true });

                MessageToast.show(
                    aContexts.length + " case(s) found in April 2026 across " + aItems.length + " modality(s)."
                );
            } catch (oError) {
                MessageBox.error("Failed to load cases: " + (oError.message || oError));
            }
        },

        // ── Select a row from the Cases table (create mode only) ──────────────
        async onCasesRowSelect(oEvent) {
            if (!this._bCreateMode) return;

            const oCtx = oEvent.getSource().getBindingContext("cases");
            const { modalityID, totalQty } = oCtx.getObject();

            try {
                const oBinding = this.getView().getModel().bindList("/Collective", null, null, [
                    new Filter("modalityID", FilterOperator.EQ, modalityID)
                ]);
                const aCtxs = await oBinding.requestContexts(0, 10);

                if (!aCtxs.length) {
                    MessageToast.show("No package found for modality: " + modalityID);
                    return;
                }

                const sExamCode = aCtxs[0].getObject().examCode;

                this.getView().bindElement({
                    path: "/Collective(examCode='" + sExamCode + "')",
                    parameters: { $$updateGroupId: "collectiveGroup" }
                });

                // Store actual case count to override stored totalQtyPerModality
                this._nActualQty = totalQty;

                this.getView().getModel("mode").setProperty("/pkgSelected", true);
                this.getView().getModel("calc").setData({
                    grossAmount: 0, discountPercent: 0, discountAmount: 0, netAmount: 0, calculated: false
                });

                MessageToast.show(
                    "Package " + sExamCode + " selected (" + totalQty + " cases in April 2026)"
                );
            } catch (oError) {
                MessageBox.error("Failed to load package: " + (oError.message || oError));
            }
        },

        // ── Calculate discount ────────────────────────────────────────────────
        async onCalculateDiscount() {
            const oView = this.getView();
            const oCollCtx = oView.getBindingContext();

            if (!oCollCtx) {
                MessageToast.show("Data is still loading, please wait.");
                return;
            }

            const oCollData = await oCollCtx.requestObject();

            // In create mode use the actual April 2026 case count; otherwise use stored value
            const nQty = (this._bCreateMode && this._nActualQty != null)
                ? this._nActualQty
                : parseInt(oCollData.totalQtyPerModality, 10);

            const nGross  = parseFloat(oCollData.priceWithoutTax);
            const sGroupID = oCollData.modalityGroup;

            const oListBinding = oView.getModel().bindList("/ModalityGroups");
            const aContexts = await oListBinding.requestContexts(0, 100);
            const oGroup = aContexts
                .map(c => c.getObject())
                .find(g => g.modalityGroupID === sGroupID);

            if (!oGroup) {
                MessageToast.show("Modality group '" + sGroupID + "' not found.");
                return;
            }

            const nT1 = parseFloat(oGroup.firstThresholdVolume);
            const nT2 = parseFloat(oGroup.secondThresholdVolume);
            const nD1 = parseFloat(oGroup.appliedDiscountForFirstThreshold);
            const nD2 = parseFloat(oGroup.appliedDiscountForSecondThreshold);

            let nDiscPct = 0;
            if      (nQty >= nT2) nDiscPct = nD2;
            else if (nQty >= nT1) nDiscPct = nD1;

            const nDiscAmt = nGross * nDiscPct / 100;
            const nNet     = nGross - nDiscAmt;

            oView.getModel("calc").setData({
                grossAmount:     nGross.toFixed(2),
                discountPercent: nDiscPct.toFixed(2),
                discountAmount:  nDiscAmt.toFixed(2),
                netAmount:       nNet.toFixed(2),
                calculated: true
            });

            MessageToast.show("Discount calculated successfully!");
        },

        // ── Save / Create Service Order ───────────────────────────────────────
        async onCreateServiceOrder() {
            const oView   = this.getView();
            const oCalc   = oView.getModel("calc").getData();
            const oCollCtx = oView.getBindingContext();
            const oCollData = await oCollCtx.requestObject();

            const sToday = new Date().toISOString().slice(0, 10);

            MessageBox.confirm(
                "Create a Service Order for package " + oCollData.examCode + "?\n" +
                "Net Amount: " + oCalc.netAmount + " SAR  (Discount: " + oCalc.discountPercent + "%)",
                {
                    title: "Confirm Service Order",
                    onClose: async (sAction) => {
                        if (sAction !== MessageBox.Action.OK) return;

                        try {
                            const oListBinding = oView.getModel().bindList("/ServiceOrder");
                            const oNewCtx = oListBinding.create({
                                collective_examCode: oCollData.examCode,
                                orderDate:           sToday,
                                status:              "Confirmed",
                                grossAmount:         parseFloat(oCalc.grossAmount),
                                discountPercent:     parseFloat(oCalc.discountPercent),
                                discountAmount:      parseFloat(oCalc.discountAmount),
                                netAmount:           parseFloat(oCalc.netAmount)
                            });

                            await oNewCtx.created();

                            MessageBox.success("Service Order created successfully!", {
                                onClose: () => {
                                    this.getOwnerComponent().getRouter().navTo("RouteServiceOrder");
                                }
                            });
                        } catch (oError) {
                            MessageBox.error("Failed to create Service Order: " + (oError.message || oError));
                        }
                    }
                }
            );
        }
    });
});
