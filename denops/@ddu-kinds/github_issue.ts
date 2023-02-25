import { BaseKind, ActionArguments, ActionFlags } from "https://deno.land/x/ddu_vim@v2.3.0/types.ts";

export type ActionData = {
  issue_number: number;
}

type Params = Record<never, never>;

export class Kind extends BaseKind<Params> {
  actions: Record<string, (args: ActionArguments<Params>) => Promise<ActionFlags>> = {
    view_web: async (args: ActionArguments<Params>): Promise<ActionFlags> => {
      const decoder = new TextDecoder();

      const getCwdResult = await args.denops.call("getcwd")
      const cwd = getCwdResult as string

      for (const item of args.items) {
        const action = item?.action as ActionData;

        const cmd = new Deno.Command("gh", { args: ["issue", "view", "--web", action.issue_number.toString()], cwd: cwd });
        const result = cmd.outputSync();

        if (!result.success) {
          console.log(decoder.decode(result.stderr));
        }
      }

      return ActionFlags.None;
    },
  }

  params(): Params {
    return {};
  }
}
