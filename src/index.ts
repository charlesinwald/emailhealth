import { checkEmailHealth } from "./checkEmailHealth";
import { formatReportMessage, readCommandLineArguments } from "./utils";
import { ui } from "@rezi-ui/core";
import { createNodeApp } from "@rezi-ui/node";
import type { Report } from "./types";

const main = async () => {
  const args = readCommandLineArguments();
  const email = args.email;
  const reports = await checkEmailHealth(email);
  type State = { reports: Report[] };
  const app = createNodeApp<State>({ initialState: { reports } });
  app.view((state) =>
    ui.page({
      p: 1,
      gap: 1,
      header: ui.header({ title: `Email Health for ${email}` }),
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
              }));
            },
            items: state.reports.map((report) => ({
              key: report.title,
              title: report.title,
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
