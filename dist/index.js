"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const checkEmailHealth_1 = require("./checkEmailHealth");
const utils_1 = require("./utils");
const core_1 = require("@rezi-ui/core");
const node_1 = require("@rezi-ui/node");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const args = (0, utils_1.readCommandLineArguments)();
    const email = args.email;
    const reports = yield (0, checkEmailHealth_1.checkEmailHealth)(email);
    const reportScore = reports && reports.length > 0
        ? reports.reduce((acc, report) => {
            return acc + (report.status === "healthy" ? 1 : 0);
        }, 0) / ((reports === null || reports === void 0 ? void 0 : reports.length) || 0)
        : 0;
    const app = (0, node_1.createNodeApp)({
        initialState: { reports: reports || [], reportScore },
    });
    app.view((state) => core_1.ui.page({
        p: 1,
        gap: 1,
        header: core_1.ui.header({
            title: `Email Health for ${email}`,
            actions: [
                core_1.ui.gauge(state.reportScore, { label: "Health", variant: "compact" }),
            ],
        }),
        body: core_1.ui.box({
            width: "full",
            height: "full",
            flex: 1,
            p: 1,
            border: "none",
        }, [
            core_1.ui.accordion({
                id: "reports",
                expanded: state.reports
                    .filter((report) => report.expanded)
                    .map((report) => report.title),
                onChange: (expanded) => {
                    app.update((s) => ({
                        reports: s.reports.map((report) => (Object.assign(Object.assign({}, report), { expanded: expanded.includes(report.title) }))),
                        reportScore: state.reportScore,
                    }));
                },
                items: state.reports.map((report) => {
                    var _a;
                    const lines = (0, utils_1.formatReportMessage)(report.message).split("\n");
                    const heading = (_a = lines[0]) !== null && _a !== void 0 ? _a : report.title;
                    const bodyLines = lines.slice(1);
                    return {
                        key: report.title,
                        title: ` ${report.status === "healthy" ? "✓" : "✗"} ${report.title} (${report.status.charAt(0).toUpperCase() + report.status.slice(1)})`,
                        content: core_1.ui.box({
                            preset: "card",
                            width: "full",
                            flex: 1,
                            p: 1,
                            border: "none",
                        }, [
                            core_1.ui.column({ gap: 1, width: "full", flex: 1 }, [
                                core_1.ui.row({ gap: 1, items: "center", wrap: true }, [
                                    core_1.ui.text(heading, { variant: "heading", wrap: true }),
                                    core_1.ui.button({
                                        id: `copy-${report.title}`,
                                        label: "Copy",
                                        dsVariant: "solid",
                                        dsSize: "sm",
                                        onPress: () => {
                                            (0, utils_1.copyToClipboard)((0, utils_1.formatReportMessage)(report.message));
                                        },
                                    }),
                                ]),
                                ...(bodyLines.length > 0
                                    ? [
                                        core_1.ui.virtualList({
                                            id: `report-${report.title}`,
                                            items: bodyLines,
                                            estimateItemHeight: 1,
                                            width: "full",
                                            flex: 1,
                                            renderItem: (line, index) => core_1.ui.text(line.length > 0 ? line : " ", {
                                                wrap: true,
                                                key: `line-${index}`,
                                            }),
                                        }),
                                    ]
                                    : []),
                            ]),
                        ]),
                    };
                }),
            }),
        ]),
    }));
    yield app.start();
});
main();
