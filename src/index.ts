import { checkEmailHealth } from "./checkEmailHealth";
import { formatReportMessage, readCommandLineArguments } from "./utils";
import { ui } from "@rezi-ui/core";
import { createNodeApp } from "@rezi-ui/node";
import type { Report } from "./types";

type State = { reports: Report[]; reportScore: number };

const main = async () => {
  const args = readCommandLineArguments();
  const email = args.email;
  const reports = await checkEmailHealth(email);
  const reportScore =
    reports.reduce((acc, report) => {
      return acc + (report.status === "healthy" ? 1 : 0);
    }, 0) / reports.length || 0;
  const app = createNodeApp<State>({
    initialState: { reports, reportScore },
  });
  app.view((state) =>
    ui.page({
      p: 1,
      gap: 1,
      header: ui.header({ title: `Email Health for ${email}`, actions: [ui.gauge(state.reportScore, { label: "Health", variant: "compact" })] }),
      body: ui.box(
        {
          width: "full",
          height: "full",
          flex: 1,
          p: 1,
          border: "none",
        },
        [
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
            items: state.reports.map((report) => ({
              key: report.title,
              title: ` ${report.status === "healthy" ? "✓" : "✗"} ${report.title} (${report.status.charAt(0).toUpperCase() + report.status.slice(1)})`,
              content: ui.box(
                { width: "full", flex: 1, p: 1, border: "none" },
                [
                  ui.virtualList({
                    id: `report-${report.title}`,
                    items: formatReportMessage(report.message).split("\n"),
                    estimateItemHeight: 1,
                    width: "full",
                    height: "full",
                    renderItem: (line, index) =>
                      ui.text(line.length > 0 ? line : " ", {
                        wrap: true,
                        key: `line-${index}`,
                      }),
                  }),
                ],
              ),
            })),
          }),
        ],
      ),
    }),
  );
  await app.start();
};
main();
