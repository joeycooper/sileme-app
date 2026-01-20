import type { Dispatch, SetStateAction } from "react";
import { useCallback, useState } from "react";

type UpdateField<T> = <K extends keyof T>(key: K, value: T[K]) => void;

type UseFormStateResult<T> = {
  form: T;
  setForm: Dispatch<SetStateAction<T>>;
  updateField: UpdateField<T>;
  resetForm: (next?: T) => void;
};

export function useFormState<T>(initial: T): UseFormStateResult<T> {
  const [form, setForm] = useState<T>(initial);

  const updateField = useCallback<UpdateField<T>>((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetForm = useCallback(
    (next?: T) => {
      if (next !== undefined) {
        setForm(next);
      } else {
        setForm(initial);
      }
    },
    [initial]
  );

  return { form, setForm, updateField, resetForm };
}
