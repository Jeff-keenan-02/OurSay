// components/common/QuerySection.tsx

import React from "react";
import { Section } from "../../layout/Section";
import { SectionLoader, SectionError } from "./SectionState";

type QueryState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

type Props<T> = {
  label: string;
  query: QueryState<T>;
  children: (data: T) => React.ReactNode;
};

export function QuerySection<T>({
  label,
  query,
  children,
}: Props<T>) {
  return (
    <Section label={label}>
      {query.loading ? (
        <SectionLoader />
      ) : query.error ? (
        <SectionError message={query.error} />
      ) : query.data ? (
        children(query.data)   // 🔥 T — NOT T | null
      ) : null}
    </Section>
  );
}