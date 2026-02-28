import { toastService } from "../components/common/toastService";

export async function withToast<T>(action: () => Promise<T>, messages: { success?: string; error?: string }): Promise<T> {
  try {
    const r = await action();
    if (messages.success) toastService.success(messages.success);
    return r;
  } catch (e: unknown) {
    let errMsg = "Error";
    if (messages.error) errMsg = messages.error;
    else if (e instanceof Error) errMsg = e.message;
    else if (typeof e === "string") errMsg = e;
    else {
      try {
        errMsg = JSON.stringify(e);
      } catch {
        errMsg = String(e);
      }
    }

    toastService.error(errMsg ?? "Error");
    throw e;
  }
}
