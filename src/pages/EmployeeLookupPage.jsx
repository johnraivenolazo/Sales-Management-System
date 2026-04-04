import { useEffect, useMemo, useState } from "react";
import PageLoadingState from "../components/PageLoadingState.jsx";
import { LookupPageShell } from "../features/lookups/LookupPageShell.jsx";
import { formatDisplayDate } from "../features/sales/salesFormatting.js";
import { getEmployees } from "../services/lookupService.js";

function EmployeeLookupPage() {
  const [employees, setEmployees] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadEmployees() {
      try {
        const rows = await getEmployees();

        if (!active) {
          return;
        }

        setEmployees(rows);
        setIsLoading(false);
      } catch (nextError) {
        if (!active) {
          return;
        }

        setError(nextError.message ?? "Unable to load the employee lookup.");
        setIsLoading(false);
      }
    }

    void loadEmployees();

    return () => {
      active = false;
    };
  }, []);

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return employees.filter((employee) => {
      if (!normalizedQuery) {
        return true;
      }

      const fullName = `${employee.lastname} ${employee.firstname}`.toLowerCase();
      return (
        employee.empno.toLowerCase().includes(normalizedQuery) ||
        fullName.includes(normalizedQuery)
      );
    });
  }, [employees, query]);

  if (isLoading) {
    return (
      <PageLoadingState
        compact
        eyebrow="Employee lookup"
        title="Loading employees"
        description="Getting the latest employee records."
      />
    );
  }

  return (
    <LookupPageShell
      eyebrow="Employee lookup"
      metrics={[
        { label: "Visible employees", value: filteredEmployees.length },
        {
          label: "Separated",
          value: filteredEmployees.filter((employee) => employee.sepDate).length,
        },
      ]}
      summary="Browse employee records."
      title="Employees"
    >
      <section className="rounded-[2rem] border border-slate-900/5 bg-white p-5 shadow-sm">
        <input
          className="w-full rounded-2xl border border-slate-900/10 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-900/30 focus:bg-white"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search employee code or name"
          type="search"
          value={query}
        />
      </section>

      {error ? (
        <section className="rounded-[2rem] border border-rose-900/10 bg-rose-50 px-6 py-5 text-sm leading-6 text-rose-900 shadow-sm">
          {error}
        </section>
      ) : null}

      <div className="grid gap-4 xl:hidden">
        {filteredEmployees.map((employee) => (
          <article className="rounded-[1.75rem] border border-slate-900/5 bg-white p-5 shadow-sm" key={employee.empno}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
              {employee.empno}
            </p>
            <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-900">
              {employee.lastname}, {employee.firstname}
            </h3>
            <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
              <p>Gender: <span className="font-semibold text-slate-900">{employee.gender}</span></p>
              <p>Hire date: <span className="font-semibold text-slate-900">{formatDisplayDate(employee.hiredate)}</span></p>
              <p>Birthdate: <span className="font-semibold text-slate-900">{formatDisplayDate(employee.birthdate)}</span></p>
              <p>Separated: <span className="font-semibold text-slate-900">{employee.sepDate ? formatDisplayDate(employee.sepDate) : "Active"}</span></p>
            </div>
          </article>
        ))}
      </div>

      <section className="hidden overflow-hidden rounded-[2rem] border border-slate-900/5 bg-white shadow-sm xl:block">
        <div className="app-scrollbar overflow-x-auto">
          <table className="min-w-full border-collapse text-left">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Code</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Name</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Gender</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Hire date</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em]">Separated</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr className="border-t border-slate-900/5" key={employee.empno}>
                  <td className="px-5 py-4 font-black tracking-tight text-slate-900">{employee.empno}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                    {employee.lastname}, {employee.firstname}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{employee.gender}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">{formatDisplayDate(employee.hiredate)}</td>
                  <td className="px-5 py-4 text-sm text-slate-600">
                    {employee.sepDate ? formatDisplayDate(employee.sepDate) : "Active"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </LookupPageShell>
  );
}

export default EmployeeLookupPage;
