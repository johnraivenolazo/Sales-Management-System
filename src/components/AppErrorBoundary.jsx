import { Component } from "react";

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message ?? "Something went wrong while rendering the page.",
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("AppErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-[#f7f1e6] px-6 py-12">
          <section className="w-full max-w-2xl rounded-[2rem] border border-rose-900/10 bg-white p-10 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-700">
              Unexpected error
            </p>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
              The app hit a recoverable problem.
            </h1>
            <p className="mt-5 text-base leading-7 text-slate-600">
              Refresh the page and try again. If the problem keeps happening,
              capture the failing step and console message before reporting it.
            </p>
            <div className="mt-6 rounded-3xl bg-rose-50 px-5 py-4 text-sm leading-6 text-rose-900">
              {this.state.message}
            </div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
