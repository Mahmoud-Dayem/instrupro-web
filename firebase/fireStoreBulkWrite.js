import { getFirestore, doc, setDoc } from "firebase/firestore";

const firestore = getFirestore();

/**
 * Write one or more task documents to Firestore
 * @param {Array|Object} data - A single document object or an array of documents
 */
export const writeAllTasksToFirestore = async (data) => {
  try {
    if (!data) {
      console.warn("No data provided to write.");
      return;
    }

    const tasksArray = Array.isArray(data) ? data : [data];

    for (const task of tasksArray) {
      const { sectionId } = task;
      if (!sectionId) {
        console.warn("Missing sectionId in task:", task);
        continue;
      }

      await setDoc(doc(firestore, "allTasks", sectionId), task);
     }

   } catch (error) {
    console.error("Error writing documents to Firestore:", error);
  }
};
