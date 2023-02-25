import { BaseSource, Item } from "https://deno.land/x/ddu_vim@v2.3.0/types.ts";
import { GatherArguments } from "https://deno.land/x/ddu_vim@v2.3.0/base/source.ts";
import { ActionData } from "../@ddu-kinds/github_pr.ts";

type Params = Record<never, never>;

type PrItem = {
  id: string;
  number: number;
  title: string;
  headRefName: string;
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
  kind = "github_pr"

  gather(args: GatherArguments<Params>): ReadableStream<Item<ActionData>[]> {
    return new ReadableStream({
      async start(controller) {
        const getCwdResult = await args.denops.call("getcwd")
        const cwd = getCwdResult as string

        const cmd = new Deno.Command("gh", { args: ["pr", "list", "--json", "id,number,title,headRefName"], cwd: cwd });
        const result = cmd.outputSync();

        if (!result.success) {
          console.log(decoder.decode(result.stderr));
          return;
        }

        const stdout = decoder.decode(result.stdout);
        const prItems: PrItem[] = JSON.parse(stdout);

        const items = prItems.map((prItem): Item<ActionData> => {
          const line = [`#${prItem.number}`, prItem.title, prItem.headRefName].join("\t")

          return {
            word: prItem.id,
            display: line,
            action: { pr_number: prItem.number },
            highlights: [
              { name: "pr_number", hl_group: "Comment", col: 1, width: byteLength(`#${prItem.number}`)},
              { name: "head_ref_name", hl_group: "Identifier", col: charposToBytepos(line, line.lastIndexOf("\t") + 1) + 1, width: byteLength(prItem.headRefName)},
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
