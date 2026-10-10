import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Send,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
  User,
  Users,
  MapPin,
  GraduationCap,
  BookOpen,
  Award,
} from "lucide-react";

import ApplicantLayout from "../../components/layout/ApplicantLayout";
import applicantApi from "../../services/applicantApi";


// ============================================================
// EMPTY FORM
// ============================================================

const EMPTY_FORM = {
  date_of_birth: "",
  gender: "",
  category: "",
  nationality: "",

  father_name: "",
  mother_name: "",

  address_line: "",
  city: "",
  district: "",
  state: "",
  pincode: "",

  tenth_school: "",
  tenth_board: "",
  tenth_passing_year: "",
  tenth_roll_number: "",
  tenth_percentage: "",

  twelfth_school: "",
  twelfth_board: "",
  twelfth_stream: "",
  twelfth_passing_year: "",
  twelfth_roll_number: "",
  twelfth_percentage: "",

  jee_attempted: false,
  jee_year: "",
  jee_percentile: "",
  jee_rank: "",
};


// ============================================================
// HELPERS
// ============================================================

const buildForm = (application = {}) => {
  return {
    ...EMPTY_FORM,

    date_of_birth: application.date_of_birth || "",
    gender: application.gender || "",
    category: application.category || "",
    nationality: application.nationality || "",

    father_name: application.father_name || "",
    mother_name: application.mother_name || "",

    address_line: application.address_line || "",
    city: application.city || "",
    district: application.district || "",
    state: application.state || "",
    pincode: application.pincode || "",

    tenth_school: application.tenth_school || "",
    tenth_board: application.tenth_board || "",
    tenth_passing_year:
      application.tenth_passing_year || "",
    tenth_roll_number:
      application.tenth_roll_number || "",
    tenth_percentage:
      application.tenth_percentage ?? "",

    twelfth_school: application.twelfth_school || "",
    twelfth_board: application.twelfth_board || "",
    twelfth_stream: application.twelfth_stream || "",
    twelfth_passing_year:
      application.twelfth_passing_year || "",
    twelfth_roll_number:
      application.twelfth_roll_number || "",
    twelfth_percentage:
      application.twelfth_percentage ?? "",

    jee_attempted:
      Boolean(application.jee_attempted),

    jee_year: application.jee_year || "",
    jee_percentile:
      application.jee_percentile ?? "",
    jee_rank:
      application.jee_rank || "",
  };
};


const getStatusLabel = (status) => {
  if (!status) return "Draft";

  return String(status)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};


const isApplicationLocked = (status) => {
  const normalized = String(status || "").toLowerCase();

  return [
    "submitted",
    "approved",
    "rejected",
    "confirmed",
  ].includes(normalized);
};


// ============================================================
// FORM FIELD
// ============================================================

function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  disabled = false,
  required = false,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
      />
    </div>
  );
}


// ============================================================
// SELECT FIELD
// ============================================================

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  disabled = false,
  required = false,
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <select
        name={name}
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
      >
        <option value="">
          Select {label}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}


// ============================================================
// SECTION
// ============================================================

function FormSection({
  icon,
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

      <div className="flex items-start gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
          {icon}
        </div>

        <div>
          <h2 className="font-bold text-gray-900">
            {title}
          </h2>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            {description}
          </p>
        </div>

      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        {children}
      </div>

    </section>
  );
}


// ============================================================
// APPLICATION PAGE
// ============================================================

function ApplicantApplication() {
  const navigate = useNavigate();

  const [application, setApplication] =
    useState(null);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ============================================================
  // LOCK STATUS
  // ============================================================

  const isLocked = useMemo(() => {
    return isApplicationLocked(
      application?.status
    );
  }, [application?.status]);


  // ============================================================
  // LOAD APPLICATION
  // ============================================================

  const loadApplication = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await applicantApi.get(
          "/campus/applicant/application"
        );

      setApplication(response.data);
      setForm(buildForm(response.data));

    } catch (err) {
      console.error(
        "Failed to load applicant application:",
        err
      );

      if (
        err.response?.status === 401
      ) {
        localStorage.removeItem(
          "applicant_token"
        );

        navigate(
          "/applicant/login",
          {
            replace: true,
          }
        );

        return;
      }

      setError(
        err.response?.data?.detail ||
          "Unable to load your application."
      );

    } finally {
      setLoading(false);
    }
  };


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadApplication();
  }, []);


  // ============================================================
  // INPUT CHANGE
  // ============================================================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setSuccess("");
    setError("");
  };


  // ============================================================
  // SAVE DRAFT
  // ============================================================

  const handleSave = async () => {
    if (isLocked) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await applicantApi.put(
          "/campus/applicant/application",
          form
        );

      setApplication(response.data);
      setForm(buildForm(response.data));

      setSuccess(
        "Application draft saved successfully."
      );

    } catch (err) {
      console.error(
        "Failed to save application:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to save your application."
      );

    } finally {
      setSaving(false);
    }
  };


  // ============================================================
  // SUBMIT APPLICATION
  // ============================================================

  const handleSubmit = async () => {
    if (isLocked) return;

    if (
      Number(
        application?.completion_percentage || 0
      ) < 100
    ) {
      setError(
        "Please complete all required fields before submitting your application."
      );

      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await applicantApi.post(
          "/campus/applicant/application/submit"
        );

      setApplication(response.data);
      setForm(buildForm(response.data));

      setSuccess(
        "Application submitted successfully."
      );

    } catch (err) {
      console.error(
        "Failed to submit application:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to submit your application."
      );

    } finally {
      setSubmitting(false);
    }
  };


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <ApplicantLayout>

        <div className="flex min-h-[70vh] items-center justify-center">

          <div className="text-center">

            <RefreshCw
              size={28}
              className="mx-auto animate-spin text-gray-500"
            />

            <p className="mt-4 text-sm font-medium text-gray-600">
              Loading your application...
            </p>

          </div>

        </div>

      </ApplicantLayout>
    );
  }


  // ============================================================
  // ERROR
  // ============================================================

  if (error && !application) {
    return (
      <ApplicantLayout>

        <div className="flex min-h-[70vh] items-center justify-center">

          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">

              <AlertCircle
                size={24}
                className="text-red-600"
              />

            </div>

            <h1 className="mt-5 text-xl font-bold text-gray-900">
              Unable to Load Application
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={loadApplication}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              <RefreshCw size={16} />
              Try Again
            </button>

          </div>

        </div>

      </ApplicantLayout>
    );
  }


  // ============================================================
  // DATA
  // ============================================================

  const completion =
    Number(
      application?.completion_percentage || 0
    );


  const status =
    String(
      application?.status || "draft"
    ).toLowerCase();


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <ApplicantLayout>

      <div className="mx-auto max-w-6xl space-y-6 pb-28">

        {/* ====================================================
            HEADER
        ===================================================== */}

        <div>

          <button
            type="button"
            onClick={() =>
              navigate("/applicant/dashboard")
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>


          <div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>

              <p className="text-sm font-medium text-gray-500">
                Applicant Portal
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900">
                My Application
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                Complete your admission application carefully.
                You can save it as a draft and continue later.
              </p>

            </div>


            <div className="flex items-center gap-3">

              <span className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700">
                {getStatusLabel(status)}
              </span>

              <button
                type="button"
                onClick={loadApplication}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh
              </button>

            </div>

          </div>

        </div>


        {/* ====================================================
            LOCKED NOTICE
        ===================================================== */}

        {isLocked && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">

            <div className="flex items-start gap-3">

              <Lock
                size={20}
                className="mt-0.5 shrink-0 text-amber-700"
              />

              <div>

                <p className="font-semibold text-amber-900">
                  Application is locked
                </p>

                <p className="mt-1 text-sm leading-6 text-amber-800">
                  Your application has been{" "}
                  <strong>
                    {getStatusLabel(status).toLowerCase()}
                  </strong>
                  . The submitted information can no longer
                  be edited from the applicant portal.
                </p>

              </div>

            </div>

          </div>
        )}


        {/* ====================================================
            ERROR / SUCCESS
        ===================================================== */}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">

            <div className="flex items-start gap-3">

              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <p className="text-sm font-medium text-red-700">
                {error}
              </p>

            </div>

          </div>
        )}


        {success && (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4">

            <div className="flex items-start gap-3">

              <CheckCircle2
                size={19}
                className="mt-0.5 shrink-0 text-green-600"
              />

              <p className="text-sm font-medium text-green-700">
                {success}
              </p>

            </div>

          </div>
        )}


        {/* ====================================================
            COMPLETION
        ===================================================== */}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Application Completion
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                {completion}%
              </p>

            </div>


            <div className="w-full md:max-w-md">

              <div className="h-3 overflow-hidden rounded-full bg-gray-100">

                <div
                  className="h-full rounded-full bg-gray-900 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      completion
                    )}%`,
                  }}
                />

              </div>

              <p className="mt-2 text-xs text-gray-500">
                {completion === 100
                  ? "All required information is complete."
                  : "Complete all required fields before submitting."}
              </p>

            </div>

          </div>

        </section>


        {/* ====================================================
            PERSONAL INFORMATION
        ===================================================== */}

        <FormSection
          icon={<User size={19} />}
          title="Personal Information"
          description="Enter your basic personal details."
        >

          <FormField
            label="Date of Birth"
            name="date_of_birth"
            type="date"
            value={form.date_of_birth}
            onChange={handleChange}
            disabled={isLocked}
            required
          />

          <SelectField
            label="Gender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            disabled={isLocked}
            required
            options={[
              {
                value: "male",
                label: "Male",
              },
              {
                value: "female",
                label: "Female",
              },
              {
                value: "other",
                label: "Other",
              },
            ]}
          />

          <SelectField
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            disabled={isLocked}
            required
            options={[
              {
                value: "general",
                label: "General",
              },
              {
                value: "obc",
                label: "OBC",
              },
              {
                value: "sc",
                label: "SC",
              },
              {
                value: "st",
                label: "ST",
              },
              {
                value: "ews",
                label: "EWS",
              },
            ]}
          />

          <FormField
            label="Nationality"
            name="nationality"
            value={form.nationality}
            onChange={handleChange}
            placeholder="Indian"
            disabled={isLocked}
            required
          />

        </FormSection>


        {/* ====================================================
            PARENT / GUARDIAN
        ===================================================== */}

        <FormSection
          icon={<Users size={19} />}
          title="Parent / Guardian Information"
          description="Provide your parent or guardian details."
        >

          <FormField
            label="Father's Name"
            name="father_name"
            value={form.father_name}
            onChange={handleChange}
            disabled={isLocked}
            required
          />

          <FormField
            label="Mother's Name"
            name="mother_name"
            value={form.mother_name}
            onChange={handleChange}
            disabled={isLocked}
            required
          />

        </FormSection>


        {/* ====================================================
            ADDRESS
        ===================================================== */}

        <FormSection
          icon={<MapPin size={19} />}
          title="Address"
          description="Enter your current residential address."
        >

          <div className="md:col-span-2">
            <FormField
              label="Address"
              name="address_line"
              value={form.address_line}
              onChange={handleChange}
              placeholder="House number, street, locality"
              disabled={isLocked}
              required
            />
          </div>

          <FormField
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
            disabled={isLocked}
            required
          />

          <FormField
            label="District"
            name="district"
            value={form.district}
            onChange={handleChange}
            disabled={isLocked}
            required
          />

          <FormField
            label="State"
            name="state"
            value={form.state}
            onChange={handleChange}
            disabled={isLocked}
            required
          />

          <FormField
            label="Pincode"
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            type="text"
            placeholder="6 digit pincode"
            disabled={isLocked}
            required
          />

        </FormSection>


        {/* ====================================================
            10TH
        ===================================================== */}

        <FormSection
          icon={<BookOpen size={19} />}
          title="10th / Secondary Education"
          description="Enter your Class 10 academic details."
        >

          <FormField
            label="School"
            name="tenth_school"
            value={form.tenth_school}
            onChange={handleChange}
            disabled={isLocked}
            required
          />

          <FormField
            label="Board"
            name="tenth_board"
            value={form.tenth_board}
            onChange={handleChange}
            placeholder="CBSE / ICSE / State Board"
            disabled={isLocked}
            required
          />

          <FormField
            label="Passing Year"
            name="tenth_passing_year"
            value={form.tenth_passing_year}
            onChange={handleChange}
            type="number"
            disabled={isLocked}
            required
          />

          <FormField
            label="Roll Number"
            name="tenth_roll_number"
            value={form.tenth_roll_number}
            onChange={handleChange}
            disabled={isLocked}
            required
          />

          <FormField
            label="Percentage"
            name="tenth_percentage"
            value={form.tenth_percentage}
            onChange={handleChange}
            type="number"
            placeholder="Example: 85.5"
            disabled={isLocked}
            required
          />

        </FormSection>


        {/* ====================================================
            12TH
        ===================================================== */}

        <FormSection
          icon={<GraduationCap size={19} />}
          title="12th / Senior Secondary Education"
          description="Enter your Class 12 academic details."
        >

          <FormField
            label="School"
            name="twelfth_school"
            value={form.twelfth_school}
            onChange={handleChange}
            disabled={isLocked}
            required
          />

          <FormField
            label="Board"
            name="twelfth_board"
            value={form.twelfth_board}
            onChange={handleChange}
            placeholder="CBSE / ICSE / State Board"
            disabled={isLocked}
            required
          />

          <SelectField
            label="Stream"
            name="twelfth_stream"
            value={form.twelfth_stream}
            onChange={handleChange}
            disabled={isLocked}
            required
            options={[
              {
                value: "science",
                label: "Science",
              },
              {
                value: "commerce",
                label: "Commerce",
              },
              {
                value: "arts",
                label: "Arts / Humanities",
              },
              {
                value: "other",
                label: "Other",
              },
            ]}
          />

          <FormField
            label="Passing Year"
            name="twelfth_passing_year"
            value={form.twelfth_passing_year}
            onChange={handleChange}
            type="number"
            disabled={isLocked}
            required
          />

          <FormField
            label="Roll Number"
            name="twelfth_roll_number"
            value={form.twelfth_roll_number}
            onChange={handleChange}
            disabled={isLocked}
            required
          />

          <FormField
            label="Percentage"
            name="twelfth_percentage"
            value={form.twelfth_percentage}
            onChange={handleChange}
            type="number"
            placeholder="Example: 79"
            disabled={isLocked}
            required
          />

        </FormSection>


        {/* ====================================================
            JEE
        ===================================================== */}

        <FormSection
          icon={<Award size={19} />}
          title="JEE / Entrance Examination"
          description="Provide JEE information if you attempted the examination."
        >

          <div className="md:col-span-2">

            <label className="flex cursor-pointer items-center gap-3">

              <input
                type="checkbox"
                name="jee_attempted"
                checked={form.jee_attempted}
                onChange={handleChange}
                disabled={isLocked}
                className="h-4 w-4 rounded border-gray-300"
              />

              <span className="text-sm font-medium text-gray-700">
                I have attempted JEE / entrance examination
              </span>

            </label>

          </div>


          {form.jee_attempted && (
            <>
              <FormField
                label="JEE Year"
                name="jee_year"
                value={form.jee_year}
                onChange={handleChange}
                type="number"
                disabled={isLocked}
                required
              />

              <FormField
                label="JEE Percentile"
                name="jee_percentile"
                value={form.jee_percentile}
                onChange={handleChange}
                type="number"
                step="0.01"
                placeholder="Example: 95.42"
                disabled={isLocked}
                required
              />

              <FormField
                label="JEE Rank"
                name="jee_rank"
                value={form.jee_rank}
                onChange={handleChange}
                type="number"
                disabled={isLocked}
                required
              />
            </>
          )}

        </FormSection>

      </div>


      {/* ======================================================
          ACTION BAR
      ======================================================= */}

      {!isLocked && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-4 shadow-lg backdrop-blur">

          <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-semibold text-gray-900">
                {completion}% complete
              </p>

              <p className="text-xs text-gray-500">
                Save your progress anytime.
              </p>

            </div>


            <div className="flex flex-col gap-2 sm:flex-row">

              <button
                type="button"
                onClick={handleSave}
                disabled={
                  saving ||
                  submitting
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {saving ? (
                  <RefreshCw
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Save size={16} />
                )}

                {saving
                  ? "Saving..."
                  : "Save Draft"}

              </button>


              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  saving ||
                  submitting ||
                  completion < 100
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {submitting ? (
                  <RefreshCw
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Send size={16} />
                )}

                {submitting
                  ? "Submitting..."
                  : "Submit Application"}

              </button>

            </div>

          </div>

        </div>
      )}

    </ApplicantLayout>
  );
}


export default ApplicantApplication;