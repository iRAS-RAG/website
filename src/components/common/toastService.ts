type Handlers = {
  success: (m: string) => void;
  error: (m: string) => void;
  info: (m: string) => void;
  warning: (m: string) => void;
} | null;

let _handlers: Handlers = null;

export const setToastHandlers = (h: Handlers) => {
  _handlers = h;
};

export const toastService = {
  success: (m: string) => _handlers?.success(m),
  error: (m: string) => _handlers?.error(m),
  info: (m: string) => _handlers?.info(m),
  warning: (m: string) => _handlers?.warning(m),
};
