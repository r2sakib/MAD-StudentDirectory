// components/add-student-form.tsx
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";
import { useStudents } from "../context/students-context";
import { Student } from "../data/students";
import FormField from "./form-field";

// Shape of the form's own state — note skillsText is a single
// string here; it gets split into an array only on submit.
interface FormData {
  name: string;
  studentId: string;
  department: string;
  bio: string;
  skillsText: string;
}

interface FormErrors {
  name?: string;
  studentId?: string;
  department?: string;
  bio?: string;
}

// Validation logic — pure function, easy to test and reason about
function validateForm(data: FormData, existing: Student[]): FormErrors {
  const newErrors: FormErrors = {};

  // Required field checks
  if (data.name.trim().length === 0) {
    newErrors.name = "Name is required.";
  } else if (data.name.trim().length < 3) {
    newErrors.name = "Name must be at least 3 characters.";
  }

  // Student ID format: NN-NNNNN-N (e.g. 22-12345-1)
  const idPattern = /^\d{2}-\d{5}-\d$/;
  if (data.studentId.trim().length === 0) {
    newErrors.studentId = "Student ID is required.";
  } else if (!idPattern.test(data.studentId.trim())) {
    newErrors.studentId = "Format must be NN-NNNNN-N (e.g. 22-12345-1).";
  } else if (existing.some((s) => s.studentId === data.studentId.trim())) {
    newErrors.studentId = "Student ID already exists";
  }

  if (data.department.trim().length === 0) {
    newErrors.department = "Department is required.";
  }

  if (data.bio.trim().length === 0) {
    newErrors.bio = "Bio is required.";
  } else if (data.bio.trim().length < 10) {
    newErrors.bio = "Bio must be at least 10 characters.";
  }

  // Skills field is optional — no validation rule

  return newErrors;
}

export default function AddStudentForm() {
  const { students, dispatch } = useStudents();

  // Combined state — all 5 text fields live together
  const [formData, setFormData] = useState<FormData>({
    name: "",
    studentId: "",
    department: "",
    bio: "",
    skillsText: "",
  });

  // Separate state — unrelated to form field values
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tracks which fields have been touched (blurred) by the user
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Tracks whether the user has attempted to submit the form
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Boolean flag used purely to trigger the submit effect
  const [submitTrigger, setSubmitTrigger] = useState(false);

  // Generic field updater — one function handles all 5 fields
  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const markTouched = (field: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // A field's error is only visible if the user has touched that
  // field, OR has attempted to submit the form.
  const getFieldError = (field: keyof FormErrors) => {
    return touched[field] || submitAttempted ? errors[field] : undefined;
  };

  // Re-validate automatically whenever any field changes.
  useEffect(() => {
    const newErrors = validateForm(formData, students);
    // Lab requirement: validate via useEffect on [formData]
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErrors(newErrors);
  }, [formData, students]);

  // Derived value — not state, computed fresh every render
  const isFormValid =
    Object.keys(errors).length === 0 &&
    formData.name.length > 0 &&
    formData.studentId.length > 0;

  // Submit effect
  // Simulates a network request and dispatches the new student
  // to the global context and navigates back after a 1.5 second delay.
  useEffect(() => {
    if (!submitTrigger) return;

    const timeoutId = setTimeout(() => {
      const newStudent: Student = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        studentId: formData.studentId.trim(),
        department: formData.department.trim(),
        bio: formData.bio.trim(),
        skills: formData.skillsText
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
        avatarUrl: "https://i.pravatar.cc/150?u=" + Date.now(),
      };

      setIsSubmitting(false);
      setSubmitTrigger(false);
      dispatch({ type: "ADD_STUDENT", payload: newStudent });
      router.back();
    }, 1500);

    // Cleanup: if the component unmounts before the timeout fires, cancel it.
    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitTrigger]);

  const handleSubmitPress = () => {
    // Mark every field touched so any remaining errors show
    setTouched((prev) => ({
      ...prev,
      name: true,
      studentId: true,
      department: true,
      bio: true,
    }));
    setSubmitAttempted(true);

    if (isFormValid) {
      setIsSubmitting(true);
      setSubmitTrigger(true);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Join the Directory</Text>
      <Text style={styles.subheading}>
        Fill in your details below to add yourself to StudentDirectory.
      </Text>

      <FormField
        label="Full Name"
        value={formData.name}
        onChangeText={(text) => updateField("name", text)}
        onBlur={() => markTouched("name")}
        placeholder="e.g. Ashraful Haque"
        error={getFieldError("name")}
      />

      <FormField
        label="Student ID"
        value={formData.studentId}
        onChangeText={(text) => updateField("studentId", text)}
        onBlur={() => markTouched("studentId")}
        placeholder="e.g. 22-12345-1"
        autoCapitalize="none"
        error={getFieldError("studentId")}
      />

      <FormField
        label="Department"
        value={formData.department}
        onChangeText={(text) => updateField("department", text)}
        onBlur={() => markTouched("department")}
        placeholder="e.g. Computer Science"
        error={getFieldError("department")}
      />

      <FormField
        label="Bio"
        value={formData.bio}
        onChangeText={(text) => updateField("bio", text)}
        onBlur={() => markTouched("bio")}
        placeholder="A short sentence about yourself..."
        multiline
        error={getFieldError("bio")}
      />

      <FormField
        label="Skills (comma-separated)"
        value={formData.skillsText}
        onChangeText={(text) => updateField("skillsText", text)}
        onBlur={() => markTouched("skillsText")}
        placeholder="e.g. React Native, TypeScript, Figma"
        autoCapitalize="none"
      />

      <Pressable
        style={[styles.button, !isFormValid && styles.buttonDisabled]}
        onPress={handleSubmitPress}
        disabled={!isFormValid || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Join Directory</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", padding: 20 },
  heading: { fontSize: 20, fontWeight: "800", color: "#0D1F4E", marginBottom: 4 },
  subheading: { fontSize: 13, color: "#64748B", marginBottom: 24, lineHeight: 19 },
  button: {
    backgroundColor: "#0D9488",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  buttonDisabled: {
    backgroundColor: "#CBD5E1",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
