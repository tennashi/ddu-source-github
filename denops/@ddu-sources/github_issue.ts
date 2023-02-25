import { BaseSource, Item } from "https://deno.land/x/ddu_vim@v2.3.0/types.ts";
import { GatherArguments } from "https://deno.land/x/ddu_vim@v2.3.0/base/source.ts";
import { ActionData } from "../@ddu-kinds/github_issue.ts";

type Params = Record<never, never>;

type IssueItem = {
  id: string;
  number: number;
  title: string;
  closed: boolean;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function charposToBytepos(input: string, pos: number): number {
  return byteLength(input.slice(0, pos));
}

function byteLength(input: string): number {
  return encoder.encode(input).length
}

export class Source extends BaseSource<Params> {
  kind = "github_issue"

  gather(args: GatherArguments<Params>): ReadableStream<Item<ActionData>[]> {
    return new ReadableStream({
      async start(controller) {
        const getCwdResult = await args.denops.call("getcwd")
        const cwd = getCwdResult as string

        const cmd = new Deno.Command("gh", { args: ["issue", "list", "--json", "id,number,title,closed", "--state", "all"], cwd: cwd });
        const result = cmd.outputSync();

        if (!result.success) {
          console.log(decoder.decode(result.stderr));
          return;
        }

        const stdout = decoder.decode(result.stdout);
        const issueItems: IssueItem[] = JSON.parse(stdout);

        const items = issueItems.map((issueItem): Item<ActionData> => {
          const line = [`#${issueItem.number}`, issueItem.title].join("\t")

          if (issueItem.closed) {
            return {
              word: issueItem.id,
              display: line,
              action: { issue_number: issueItem.number },
              highlights: [
                { name: "issue_number", hl_group: "Comment", col: 1, width: byteLength(`#${issueItem.number}`)},
                { name: "closed_issue_title", hl_group: "Comment", col: charposToBytepos(line, line.indexOf("\t")+1)+1, width: byteLength(issueItem.title)},
              ],
            }
          }

          return {
            word: issueItem.id,
            display: line,
            action: { issue_number: issueItem.number },
            highlights: [
              { name: "issue_number", hl_group: "Comment", col: 1, width: byteLength(`#${issueItem.number}`)},
            ],
          }
        })

        controller.enqueue(items);

        controller.close();
      }
    })
  }

  params(): Params {
    return {};
  }
}

