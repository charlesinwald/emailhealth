#!/usr/bin/env node
import { checkEmailHealth } from "./checkEmailHealth";
import {
  copyToClipboard,
  formatReportMessage,
  readCommandLineArguments,
} from "./utils";
import { ui } from "@rezi-ui/core";
import { createNodeApp } from "@rezi-ui/node";
import type { Report } from "./types";

type State = { reports: Report[]; reportScore: number };

const main = async () => {
  const args = readCommandLineArguments();
  const email = args.email;
  const reports = await checkEmailHealth(email);
  const reportScore =
    reports && reports.length > 0
      ? reports.reduce((acc, report) => {
          return acc + (report.status === "healthy" ? 1 : 0);
        }, 0) / (reports?.length || 0)
      : 0;
  const app = createNodeApp<State>({
    initialState: { reports: reports || [], reportScore },
  });
  app.view((state) =>
    ui.page({
      p: 1,
      gap: 1,
      header: ui.header({
        title: `Email Health for ${email}`,
        actions: [
          ui.gauge(state.reportScore, { label: "Health", variant: "compact" }),
        ],
      }),
      body: ui.box(
        {
          width: "full",
          height: "full",
          flex: 1,
          p: 1,
          border: "none",
        },
        [
          ui.focusTrap({ id: "reports-focus-trap", active: true }, [
            ui.column({ gap: 1, width: "full", height: "full", flex: 1, justify: "between", items: "stretch" }, [
              ui.accordion({
                id: "reports",
                expanded: state.reports
                  .filter((report) => report.expanded)
                  .map((report) => report.title),
                onChange: (expanded) => {
                  app.update((s) => ({
                    reports: s.reports.map((report) => ({
                      ...report,
                      expanded: expanded.includes(report.title),
                    })),
                    reportScore: state.reportScore,
                  }));
                },
                items: state.reports.map((report) => {
                  const lines = formatReportMessage(report.message).split("\n");
                  const heading = lines[0] ?? report.title;
                  const bodyLines = lines.slice(1);
                  return {
                    key: report.title,
                    title: ` ${report.status === "healthy" ? "✓" : "✗"} ${report.title} (${report.status.charAt(0).toUpperCase() + report.status.slice(1)})`,
                    content: ui.box(
                      {
                        preset: "card",
                        width: "full",
                        flex: 1,
                        p: 1,
                        border: "none",
                      },
                      [
                        ui.column({ gap: 1, width: "full", flex: 1 }, [
                          ui.row({ gap: 1, items: "center", wrap: true }, [
                            ui.text(heading, {
                              variant: "heading",
                              wrap: true,
                            }),
                            ui.button({
                              id: `copy-${report.title}`,
                              label: "Copy",
                              dsVariant: "solid",
                              dsSize: "sm",
                              onPress: () => {
                                copyToClipboard(
                                  formatReportMessage(report.message),
                                );
                              },
                            }),
                          ]),
                          ...(bodyLines.length > 0
                            ? [
                                ui.virtualList({
                                  id: `report-${report.title}`,
                                  items: bodyLines,
                                  estimateItemHeight: 1,
                                  width: "full",
                                  flex: 1,
                                  renderItem: (line, index) =>
                                    ui.text(line.length > 0 ? line : " ", {
                                      wrap: true,
                                      key: `line-${index}`,
                                    }),
                                }),
                              ]
                            : []),
                        ]),
                      ],
                    ),
                  };
                }),
              }),
              ui.row({ gap: 2 }, [
                ui.row({ gap: 1 }, [ui.kbd("Mouse"), ui.text("Full Interaction")]),
                ui.row({ gap: 1 }, [ui.kbd("Up Arrow"), ui.text("Up/Scroll")]),
                ui.row({ gap: 1 }, [ui.kbd("Down Arrow"), ui.text("Down/Scroll")]),
                ui.row({ gap: 1 }, [ui.kbd("Enter"), ui.text("Open")]),
                ui.row({ gap: 1 }, [ui.kbd("q"), ui.text("Quit")]),
              ]),
            ]),
          ]),
        ],
      ),
    }),
  );
  await app.start();
};
main();
