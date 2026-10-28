import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBar from "../../components/search-bar";
import StudentDetail from "../../components/student-detail";
import StudentItem from "../../components/student-item";
import { useStudents } from "../../context/students-context";
import { confirmAction } from "../../utils/confirm";
import { Student } from "../../data/students";

export default function Index() {
  // Read students directly from the global context
  const { students, dispatch } = useStudents();

  // These stay as local state — they belong to this screen only
  const [query, setQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.department.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (student: Student) => {
    setSelectedStudent((prev) => (prev?.id === student.id ? null : student));
  };

  // Dispatch RESET only after the user confirms; cancelling leaves the list unchanged
  const handleReset = () => {
    confirmAction(
      "Reset Directory",
      "Restore the original student list? Added and removed students will be lost.",
      "Reset",
      () => {
        dispatch({ type: "RESET" });
        setSelectedStudent(null);
      }
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.titleBar}>
        {/* Count is derived from the context list, not stored in state */}
        <Text style={styles.title}>Student Directory ({students.length})</Text>
        <View style={styles.buttons}>
          <Pressable style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.addButtonText}>Reset</Text>
          </Pressable>
          {/* Navigate to the AddStudent screen — no prop passing needed */}
          <Pressable
            style={styles.addButton}
            onPress={() => router.push("/add-student")}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </Pressable>
        </View>
      </View>

      <SearchBar value={query} onChangeText={setQuery} />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isSelected = selectedStudent?.id === item.id;
          return (
            <View>
              <StudentItem
                student={item}
                onPress={handleSelect}
                isSelected={isSelected}
              />
              {/* Detail card expands directly under the selected entry */}
              {isSelected && <StudentDetail student={item} />}
            </View>
          );
        }}
        extraData={selectedStudent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No students match &quot;{query}&quot;</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F0F4F8" },
  titleBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#0D1F4E",
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#FFFFFF", flexShrink: 1 },
  buttons: { flexDirection: "row", gap: 8 },
  resetButton: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: "#0D9488",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  empty: { padding: 40, alignItems: "center" },
  emptyText: { fontSize: 14, color: "#94A3B8" },
});
