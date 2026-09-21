import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  CalendarDays,
  Hash,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
  FileText,
  CreditCard,
  Bot,
  MapPin,
} from "lucide-react";

import ApplicantLayout from "../../components/layout/ApplicantLayout";
import applicantApi from "../../services/applicantApi";

function ApplicantProfile() {
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await applicantApi.get(
        "/campus/applicant/dashboard"
      );

      const data = response.data || {};

      setStudent(data.student || {});
      setApplication(data.application || {});
    } catch (err) {
      console.error(
        "Failed to load applicant profile:",
        err
      );

      if (err?.response?.status === 401) {
        localStorage.removeItem("applicant_token");

        navigate("/applicant/login", {
          replace: true,
        });

        return;
      }

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Unable to load your profile information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const getValue = (...values) => {
    for (const value of values) {
      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {
        return value;
      }
    }

    return "Not provided";
  };

  const formatDate = (date) => {
    if (!date) {
      return "Not provided";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const fullName = getValue(
    student?.full_name,
    student?.name,
    student?.student_name,
    application?.full_name,
    application?.applicant_name
  );

  const email = getValue(
    student?.email,
    application?.email,
    application?.applicant_email
  );

  const phone = getValue(
    student?.phone,
    student?.mobile,
    student?.phone_number,
    application?.phone,
    application?.mobile
  );

  const applicationNumber = getValue(
    application?.application_number,
    application?.application_no,
    student?.application_number
  );

  const program = getValue(
    student?.program,
    student?.course,
    student?.course_name,
    application?.program,
    application?.course
  );

  const department = getValue(
    student?.department,
    student?.department_name,
    application?.department
  );

  const academicYear = getValue(
    student?.academic_year,
    application?.academic_year
  );

  const semester = getValue(
    student?.semester,
    application?.semester
  );

  const gender = getValue(
    student?.gender,
    application?.gender
  );

  const dateOfBirth = getValue(
    student?.date_of_birth,
    student?.dob,
    application?.date_of_birth,
    application?.dob
  );

  const address = getValue(
    student?.address,
    student?.permanent_address,
    student?.current_address,
    application?.address
  );

  const admissionStatus = getValue(
    application?.admission_status,
    student?.admission_status
  );

  const applicationStatus = getValue(
    application?.status,
    application?.application_status
  );

  return (
    <ApplicantLayout>
      <div className="min-h-full bg-gray-50">

        <div className="mx-auto max-w-6xl">

          {/* =====================================================
              HEADER
          ===================================================== */}

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">

                <Link
                  to="/applicant/dashboard"
                  className="transition hover:text-gray-900"
                >
                  Dashboard
                </Link>

                <span>/</span>

                <span className="text-gray-700">
                  Profile
                </span>

              </div>

              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                My Profile
              </h1>

              <p className="mt-2 text-sm text-gray-600">
                View your personal and admission information.
              </p>

            </div>


            <button
              type="button"
              onClick={loadProfile}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >

              <RefreshCw
                size={17}
                className={
                  loading ? "animate-spin" : ""
                }
              />

              {loading ? "Refreshing..." : "Refresh"}

            </button>

          </div>


          {/* =====================================================
              ERROR
          ===================================================== */}

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
                  <ShieldCheck
                    size={21}
                    className="text-red-600"
                  />
                </div>

                <div>

                  <h2 className="font-semibold text-red-800">
                    Unable to load profile
                  </h2>

                  <p className="mt-1 text-sm text-red-700">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={loadProfile}
                    className="mt-3 text-sm font-semibold text-red-800 underline underline-offset-2"
                  >
                    Try again
                  </button>

                </div>

              </div>

            </div>
          )}


          {/* =====================================================
              LOADING
          ===================================================== */}

          {loading && (
            <div className="space-y-6">

              <div className="h-64 animate-pulse rounded-2xl bg-white" />

              <div className="h-72 animate-pulse rounded-2xl bg-white" />

              <div className="h-64 animate-pulse rounded-2xl bg-white" />

            </div>
          )}


          {/* =====================================================
              PROFILE CONTENT
          ===================================================== */}

          {!loading && !error && (
            <>

              {/* =================================================
                  PROFILE HEADER CARD
              ================================================= */}

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                <div className="h-28 bg-gray-900" />

                <div className="px-6 pb-6">

                  <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">

                      {/* Avatar */}

                      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-gray-100 shadow-sm">

                        <User
                          size={42}
                          className="text-gray-500"
                        />

                      </div>


                      {/* Name */}

                      <div className="pb-1">

                        <h2 className="text-2xl font-bold text-gray-900">
                          {fullName}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                          Applicant
                        </p>

                      </div>

                    </div>


                    {/* Account status */}

                    <div className="pb-1">

                      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">

                        <span className="h-2 w-2 rounded-full bg-emerald-500" />

                        Applicant Account

                      </span>

                    </div>

                  </div>

                </div>

              </div>


              {/* =================================================
                  PERSONAL INFORMATION
              ================================================= */}

              <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">

                    <User
                      size={20}
                      className="text-gray-700"
                    />

                  </div>

                  <div>

                    <h2 className="text-lg font-bold text-gray-900">
                      Personal Information
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Information associated with your applicant
                      account.
                    </p>

                  </div>

                </div>


                <div className="mt-6 grid gap-5 sm:grid-cols-2">

                  {/* Full Name */}

                  <ProfileField
                    icon={User}
                    label="Full Name"
                    value={fullName}
                  />

                  {/* Email */}

                  <ProfileField
                    icon={Mail}
                    label="Email Address"
                    value={email}
                  />

                  {/* Phone */}

                  <ProfileField
                    icon={Phone}
                    label="Phone Number"
                    value={phone}
                  />

                  {/* Gender */}

                  <ProfileField
                    icon={User}
                    label="Gender"
                    value={gender}
                  />

                  {/* DOB */}

                  <ProfileField
                    icon={CalendarDays}
                    label="Date of Birth"
                    value={
                      dateOfBirth === "Not provided"
                        ? dateOfBirth
                        : formatDate(dateOfBirth)
                    }
                  />

                  {/* Address */}

                  <ProfileField
                    icon={MapPin}
                    label="Address"
                    value={address}
                  />

                </div>

              </div>


              {/* =================================================
                  ACADEMIC INFORMATION
              ================================================= */}

              <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">

                    <GraduationCap
                      size={20}
                      className="text-gray-700"
                    />

                  </div>

                  <div>

                    <h2 className="text-lg font-bold text-gray-900">
                      Academic Information
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Your course and academic details.
                    </p>

                  </div>

                </div>


                <div className="mt-6 grid gap-5 sm:grid-cols-2">

                  <ProfileField
                    icon={GraduationCap}
                    label="Program"
                    value={program}
                  />

                  <ProfileField
                    icon={GraduationCap}
                    label="Department"
                    value={department}
                  />

                  <ProfileField
                    icon={CalendarDays}
                    label="Academic Year"
                    value={academicYear}
                  />

                  <ProfileField
                    icon={Hash}
                    label="Semester"
                    value={semester}
                  />

                </div>

              </div>


              {/* =================================================
                  APPLICATION INFORMATION
              ================================================= */}

              <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">

                    <FileText
                      size={20}
                      className="text-gray-700"
                    />

                  </div>

                  <div>

                    <h2 className="text-lg font-bold text-gray-900">
                      Application Information
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Information related to your admission
                      application.
                    </p>

                  </div>

                </div>


                <div className="mt-6 grid gap-5 sm:grid-cols-2">

                  <ProfileField
                    icon={Hash}
                    label="Application Number"
                    value={applicationNumber}
                  />

                  <ProfileField
                    icon={ShieldCheck}
                    label="Application Status"
                    value={applicationStatus}
                  />

                  <ProfileField
                    icon={GraduationCap}
                    label="Admission Status"
                    value={admissionStatus}
                  />

                </div>

              </div>


              {/* =================================================
                  EDIT NOTICE
              ================================================= */}

              <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                <div className="flex items-start gap-3">

                  <ShieldCheck
                    size={20}
                    className="mt-0.5 shrink-0 text-gray-500"
                  />

                  <div>

                    <h3 className="font-semibold text-gray-900">
                      Profile information
                    </h3>

                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      This information is currently displayed
                      from your application records. Profile
                      editing will be available when an
                      applicant profile update service is
                      provided by the backend.

                    </p>

                  </div>

                </div>

              </div>


              {/* =================================================
                  QUICK ACTIONS
              ================================================= */}

              <div className="mt-6 grid gap-4 md:grid-cols-3">

                <Link
                  to="/applicant/dashboard"
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md"
                >

                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">

                      <ArrowLeft
                        size={20}
                        className="text-gray-700"
                      />

                    </div>

                    <div>

                      <h3 className="font-semibold text-gray-900">
                        Dashboard
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Return to your overview
                      </p>

                    </div>

                  </div>

                </Link>


                <Link
                  to="/applicant/documents"
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md"
                >

                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">

                      <FileText
                        size={20}
                        className="text-gray-700"
                      />

                    </div>

                    <div>

                      <h3 className="font-semibold text-gray-900">
                        Documents
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Manage submitted documents
                      </p>

                    </div>

                  </div>

                </Link>


                <Link
                  to="/applicant/chat"
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md"
                >

                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">

                      <Bot
                        size={20}
                        className="text-gray-700"
                      />

                    </div>

                    <div>

                      <h3 className="font-semibold text-gray-900">
                        AI Assistant
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Ask questions about your admission
                      </p>

                    </div>

                  </div>

                </Link>

              </div>


            </>
          )}

        </div>
      </div>
    </ApplicantLayout>
  );
}


/* =============================================================
   REUSABLE PROFILE FIELD
============================================================= */

function ProfileField({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">

      <div className="flex items-start gap-3">

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">

          <Icon
            size={17}
            className="text-gray-600"
          />

        </div>

        <div className="min-w-0">

          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold text-gray-900">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}

export default ApplicantProfile;