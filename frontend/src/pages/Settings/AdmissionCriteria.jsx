import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  GraduationCap,
  Save,
  X,
  CheckCircle2,
  Power,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Layout from "../../components/layout/Layout";


/* =========================================================
   DEFAULT FORM
========================================================= */

const EMPTY_FORM = {
  program: "",
  minimum_12th_percentage: "",
  minimum_pcm_percentage: "",
  minimum_math_percentage: "",
  minimum_age: "",
  entrance_exam_required: false,
  entrance_exam_name: "",
  minimum_entrance_score: "",
};


/* =========================================================
   DEMO INITIAL DATA
   ---------------------------------------------------------
   This will later come from the backend.

   These values are ONLY frontend placeholders so we can
   complete and verify the UI before backend integration.
========================================================= */

const INITIAL_CRITERIA = [
  {
    id: 1,
    program: "B.Tech",
    minimum_12th_percentage: 60,
    minimum_pcm_percentage: 55,
    minimum_math_percentage: 50,
    minimum_age: 17,
    entrance_exam_required: true,
    entrance_exam_name: "JEE Main",
    minimum_entrance_score: "",
    is_active: true,
  },
];


/* =========================================================
   COMPONENT
========================================================= */

function AdmissionCriteria() {
  const navigate = useNavigate();

  const [criteria, setCriteria] =
    useState(INITIAL_CRITERIA);

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingCriteria, setEditingCriteria] =
    useState(null);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [saving, setSaving] =
    useState(false);


  /* =======================================================
     ACTIVE COUNT
  ======================================================= */

  const activeCount = useMemo(() => {
    return criteria.filter(
      (item) => item.is_active
    ).length;
  }, [criteria]);


  /* =======================================================
     OPEN ADD
  ======================================================= */

  const openAddModal = () => {
    setEditingCriteria(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };


  /* =======================================================
     OPEN EDIT
  ======================================================= */

  const openEditModal = (item) => {
    setEditingCriteria(item);

    setForm({
      program: item.program || "",
      minimum_12th_percentage:
        item.minimum_12th_percentage ?? "",
      minimum_pcm_percentage:
        item.minimum_pcm_percentage ?? "",
      minimum_math_percentage:
        item.minimum_math_percentage ?? "",
      minimum_age:
        item.minimum_age ?? "",
      entrance_exam_required:
        Boolean(item.entrance_exam_required),
      entrance_exam_name:
        item.entrance_exam_name || "",
      minimum_entrance_score:
        item.minimum_entrance_score ?? "",
    });

    setIsModalOpen(true);
  };


  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const closeModal = () => {
    if (saving) {
      return;
    }

    setIsModalOpen(false);
    setEditingCriteria(null);
    setForm(EMPTY_FORM);
  };


  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };


  /* =======================================================
     SAVE
  ======================================================= */

  const handleSave = async () => {
    if (!form.program.trim()) {
      toast.error("Program name is required.");
      return;
    }

    if (
      form.minimum_12th_percentage !== "" &&
      (
        Number(form.minimum_12th_percentage) < 0 ||
        Number(form.minimum_12th_percentage) > 100
      )
    ) {
      toast.error(
        "12th percentage must be between 0 and 100."
      );
      return;
    }

    if (
      form.minimum_pcm_percentage !== "" &&
      (
        Number(form.minimum_pcm_percentage) < 0 ||
        Number(form.minimum_pcm_percentage) > 100
      )
    ) {
      toast.error(
        "PCM percentage must be between 0 and 100."
      );
      return;
    }

    if (
      form.minimum_math_percentage !== "" &&
      (
        Number(form.minimum_math_percentage) < 0 ||
        Number(form.minimum_math_percentage) > 100
      )
    ) {
      toast.error(
        "Mathematics percentage must be between 0 and 100."
      );
      return;
    }

    if (
      form.minimum_age !== "" &&
      Number(form.minimum_age) < 0
    ) {
      toast.error(
        "Minimum age cannot be negative."
      );
      return;
    }

    if (
      form.entrance_exam_required &&
      !form.entrance_exam_name.trim()
    ) {
      toast.error(
        "Enter the entrance exam name."
      );
      return;
    }

    try {
      setSaving(true);

      const normalizedData = {
        program: form.program.trim(),

        minimum_12th_percentage:
          form.minimum_12th_percentage === ""
            ? null
            : Number(
                form.minimum_12th_percentage
              ),

        minimum_pcm_percentage:
          form.minimum_pcm_percentage === ""
            ? null
            : Number(
                form.minimum_pcm_percentage
              ),

        minimum_math_percentage:
          form.minimum_math_percentage === ""
            ? null
            : Number(
                form.minimum_math_percentage
              ),

        minimum_age:
          form.minimum_age === ""
            ? null
            : Number(form.minimum_age),

        entrance_exam_required:
          Boolean(
            form.entrance_exam_required
          ),

        entrance_exam_name:
          form.entrance_exam_required
            ? form.entrance_exam_name.trim()
            : null,

        minimum_entrance_score:
          form.minimum_entrance_score === ""
            ? null
            : Number(
                form.minimum_entrance_score
              ),
      };


      /* ---------------------------------------------------
         TEMPORARY FRONTEND SAVE

         Backend integration will replace this block.
      --------------------------------------------------- */

      if (editingCriteria) {
        setCriteria((previous) =>
          previous.map((item) =>
            item.id === editingCriteria.id
              ? {
                  ...item,
                  ...normalizedData,
                }
              : item
          )
        );

        toast.success(
          "Admission criteria updated."
        );
      } else {
        const newCriteria = {
          id: Date.now(),
          ...normalizedData,
          is_active: true,
        };

        setCriteria((previous) => [
          ...previous,
          newCriteria,
        ]);

        toast.success(
          "Admission criteria added."
        );
      }

      closeModal();

    } catch (error) {
      console.error(error);

      toast.error(
        "Failed to save admission criteria."
      );
    } finally {
      setSaving(false);
    }
  };


  /* =======================================================
     TOGGLE ACTIVE
  ======================================================= */

  const handleToggleActive = (item) => {
    setCriteria((previous) =>
      previous.map((criteriaItem) =>
        criteriaItem.id === item.id
          ? {
              ...criteriaItem,
              is_active:
                !criteriaItem.is_active,
            }
          : criteriaItem
      )
    );

    toast.success(
      item.is_active
        ? "Criteria deactivated."
        : "Criteria activated."
    );
  };


  /* =======================================================
     DELETE
  ======================================================= */

  const handleDelete = (item) => {
    if (
      !window.confirm(
        `Delete admission criteria for ${item.program}?`
      )
    ) {
      return;
    }

    setCriteria((previous) =>
      previous.filter(
        (criteriaItem) =>
          criteriaItem.id !== item.id
      )
    );

    toast.success(
      "Admission criteria deleted."
    );
  };


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Layout>

      <div className="mx-auto max-w-6xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 flex items-start justify-between gap-4">

          <div className="flex items-start gap-4">

            <button
              onClick={() =>
                navigate("/settings")
              }
              className="mt-1 rounded-lg border border-gray-200 bg-white p-2.5 text-gray-600 transition hover:bg-gray-50"
              title="Back to Settings"
            >
              <ArrowLeft size={20} />
            </button>


            <div>

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-indigo-100 p-3">
                  <GraduationCap
                    size={24}
                    className="text-indigo-600"
                  />
                </div>

                <div>

                  <h1 className="text-3xl font-bold text-gray-900">
                    Admission Criteria
                  </h1>

                  <p className="mt-1 text-gray-500">
                    Configure the eligibility rules
                    used by your college.
                  </p>

                </div>

              </div>

            </div>

          </div>


          <button
            onClick={openAddModal}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-gray-800"
          >
            <Plus size={18} />
            Add Program
          </button>

        </div>


        {/* =================================================
            INFORMATION
        ================================================= */}

        <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">

          <div className="flex gap-3">

            <div className="mt-0.5">
              <CheckCircle2
                size={20}
                className="text-blue-600"
              />
            </div>

            <div>

              <h2 className="font-semibold text-blue-900">
                Dynamic admission rules
              </h2>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                These criteria are configurable by
                the college administrator. The initial
                values are created when the college
                workspace is created, and administrators
                can update them whenever admission
                requirements change.
              </p>

              <p className="mt-2 text-xs font-medium text-blue-700">
                Changes here will become the active
                criteria used by future eligibility
                checks.
              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="mb-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-gray-500">
              Programs
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {criteria.length}
            </p>

          </div>


          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-gray-500">
              Active Criteria
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {activeCount}
            </p>

          </div>


          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-gray-500">
              Status
            </p>

            <p className="mt-2 text-lg font-semibold text-gray-900">
              Administrator Controlled
            </p>

          </div>

        </div>


        {/* =================================================
            PROGRAM LIST
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 px-6 py-5">

            <h2 className="font-semibold text-gray-900">
              Program Eligibility Rules
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Each program can have its own admission
              requirements.
            </p>

          </div>


          {criteria.length === 0 ? (

            <div className="px-6 py-16 text-center">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">

                <GraduationCap
                  size={26}
                  className="text-gray-500"
                />

              </div>

              <h3 className="font-semibold text-gray-900">
                No admission criteria configured
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                Add a program to configure its admission
                eligibility requirements.
              </p>

              <button
                onClick={openAddModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
              >
                <Plus size={17} />
                Add Program
              </button>

            </div>

          ) : (

            <div className="divide-y divide-gray-100">

              {criteria.map((item) => (

                <div
                  key={item.id}
                  className="p-6 transition hover:bg-gray-50/70"
                >

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                    {/* =====================================
                        PROGRAM
                    ===================================== */}

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-3">

                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.program}
                        </h3>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            item.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >

                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              item.is_active
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                          />

                          {item.is_active
                            ? "Active"
                            : "Inactive"}

                        </span>

                      </div>


                      {/* ===================================
                          CRITERIA GRID
                      =================================== */}

                      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                        <CriteriaItem
                          label="12th Percentage"
                          value={
                            item.minimum_12th_percentage !==
                            null &&
                            item.minimum_12th_percentage !==
                            undefined &&
                            item.minimum_12th_percentage !==
                            ""
                              ? `${item.minimum_12th_percentage}%`
                              : "Not specified"
                          }
                        />

                        <CriteriaItem
                          label="PCM Percentage"
                          value={
                            item.minimum_pcm_percentage !==
                            null &&
                            item.minimum_pcm_percentage !==
                            undefined &&
                            item.minimum_pcm_percentage !==
                            ""
                              ? `${item.minimum_pcm_percentage}%`
                              : "Not specified"
                          }
                        />

                        <CriteriaItem
                          label="Mathematics"
                          value={
                            item.minimum_math_percentage !==
                            null &&
                            item.minimum_math_percentage !==
                            undefined &&
                            item.minimum_math_percentage !==
                            ""
                              ? `${item.minimum_math_percentage}%`
                              : "Not specified"
                          }
                        />

                        <CriteriaItem
                          label="Minimum Age"
                          value={
                            item.minimum_age !==
                            null &&
                            item.minimum_age !==
                            undefined &&
                            item.minimum_age !==
                            ""
                              ? `${item.minimum_age} years`
                              : "Not specified"
                          }
                        />

                      </div>


                      {/* ===================================
                          ENTRANCE EXAM
                      =================================== */}

                      <div className="mt-4 rounded-xl bg-gray-50 p-4">

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Entrance Examination
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-2">

                          {item.entrance_exam_required ? (

                            <>
                              <span className="font-medium text-gray-900">
                                Required
                              </span>

                              {item.entrance_exam_name && (
                                <span className="rounded-lg bg-white px-2.5 py-1 text-sm text-gray-700 ring-1 ring-gray-200">
                                  {item.entrance_exam_name}
                                </span>
                              )}

                              {item.minimum_entrance_score !==
                                null &&
                                item.minimum_entrance_score !==
                                  undefined &&
                                item.minimum_entrance_score !==
                                  "" && (
                                  <span className="text-sm text-gray-500">
                                    Minimum score:{" "}
                                    <strong className="text-gray-700">
                                      {
                                        item.minimum_entrance_score
                                      }
                                    </strong>
                                  </span>
                                )}
                            </>

                          ) : (

                            <span className="font-medium text-gray-700">
                              Not required
                            </span>

                          )}

                        </div>

                      </div>

                    </div>


                    {/* =====================================
                        ACTIONS
                    ===================================== */}

                    <div className="flex shrink-0 items-center gap-2">

                      <button
                        onClick={() =>
                          handleToggleActive(item)
                        }
                        className={`rounded-lg border p-2.5 transition ${
                          item.is_active
                            ? "border-green-200 text-green-600 hover:bg-green-50"
                            : "border-gray-200 text-gray-500 hover:bg-gray-100"
                        }`}
                        title={
                          item.is_active
                            ? "Deactivate"
                            : "Activate"
                        }
                      >
                        <Power size={17} />
                      </button>


                      <button
                        onClick={() =>
                          openEditModal(item)
                        }
                        className="rounded-lg border border-gray-200 p-2.5 text-gray-600 transition hover:bg-gray-100"
                        title="Edit"
                      >
                        <Pencil size={17} />
                      </button>


                      <button
                        onClick={() =>
                          handleDelete(item)
                        }
                        className="rounded-lg border border-red-200 p-2.5 text-red-500 transition hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>


      {/* =========================================================
          MODAL
      ========================================================= */}

      {isModalOpen && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* ===============================================
                MODAL HEADER
            =============================================== */}

            <div className="flex items-center justify-between border-b px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  {editingCriteria
                    ? "Edit Admission Criteria"
                    : "Add Program Criteria"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Configure eligibility requirements
                  for this program.
                </p>

              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>

            </div>


            {/* ===============================================
                MODAL BODY
            =============================================== */}

            <div className="space-y-6 p-6">

              {/* PROGRAM */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Program
                </label>

                <input
                  type="text"
                  value={form.program}
                  onChange={(e) =>
                    handleChange(
                      "program",
                      e.target.value
                    )
                  }
                  placeholder="e.g. B.Tech"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

              </div>


              {/* ACADEMIC CRITERIA */}

              <div>

                <h3 className="mb-4 text-sm font-semibold text-gray-900">
                  Academic Requirements
                </h3>

                <div className="grid gap-4 sm:grid-cols-3">

                  <NumberInput
                    label="Minimum 12th %"
                    value={
                      form.minimum_12th_percentage
                    }
                    onChange={(value) =>
                      handleChange(
                        "minimum_12th_percentage",
                        value
                      )
                    }
                    placeholder="60"
                    suffix="%"
                  />


                  <NumberInput
                    label="Minimum PCM %"
                    value={
                      form.minimum_pcm_percentage
                    }
                    onChange={(value) =>
                      handleChange(
                        "minimum_pcm_percentage",
                        value
                      )
                    }
                    placeholder="55"
                    suffix="%"
                  />


                  <NumberInput
                    label="Minimum Maths %"
                    value={
                      form.minimum_math_percentage
                    }
                    onChange={(value) =>
                      handleChange(
                        "minimum_math_percentage",
                        value
                      )
                    }
                    placeholder="50"
                    suffix="%"
                  />

                </div>

              </div>


              {/* AGE */}

              <div>

                <NumberInput
                  label="Minimum Age"
                  value={form.minimum_age}
                  onChange={(value) =>
                    handleChange(
                      "minimum_age",
                      value
                    )
                  }
                  placeholder="17"
                  suffix="years"
                />

              </div>


              {/* ENTRANCE EXAM */}

              <div className="rounded-xl border border-gray-200 p-4">

                <label className="flex cursor-pointer items-center gap-3">

                  <input
                    type="checkbox"
                    checked={
                      form.entrance_exam_required
                    }
                    onChange={(e) =>
                      handleChange(
                        "entrance_exam_required",
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />

                  <span className="text-sm font-medium text-gray-800">
                    Entrance examination required
                  </span>

                </label>


                {form.entrance_exam_required && (

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">

                    <div>

                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Examination Name
                      </label>

                      <input
                        type="text"
                        value={
                          form.entrance_exam_name
                        }
                        onChange={(e) =>
                          handleChange(
                            "entrance_exam_name",
                            e.target.value
                          )
                        }
                        placeholder="e.g. JEE Main"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />

                    </div>


                    <NumberInput
                      label="Minimum Score"
                      value={
                        form.minimum_entrance_score
                      }
                      onChange={(value) =>
                        handleChange(
                          "minimum_entrance_score",
                          value
                        )
                      }
                      placeholder="Optional"
                    />

                  </div>

                )}

              </div>

            </div>


            {/* ===============================================
                MODAL FOOTER
            =============================================== */}

            <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl border border-gray-300 bg-white px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >

                <Save size={17} />

                {saving
                  ? "Saving..."
                  : editingCriteria
                  ? "Save Changes"
                  : "Add Criteria"}

              </button>

            </div>

          </div>

        </div>

      )}

    </Layout>
  );
}


/* =========================================================
   CRITERIA ITEM
========================================================= */

function CriteriaItem({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">

      <p className="text-xs font-medium text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-gray-900">
        {value}
      </p>

    </div>
  );
}


/* =========================================================
   NUMBER INPUT
========================================================= */

function NumberInput({
  label,
  value,
  onChange,
  placeholder,
  suffix,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">

        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          placeholder={placeholder}
          className={`w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${
            suffix
              ? "pr-16"
              : ""
          }`}
        />

        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">
            {suffix}
          </span>
        )}

      </div>

    </div>
  );
}


export default AdmissionCriteria;