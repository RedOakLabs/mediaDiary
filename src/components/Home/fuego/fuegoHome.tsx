import { fuegoDb } from "../../../fuego/fuego";
import type fuego from "../../../fuego/fuego";
import type { MediaType, MediaDiaryWithId } from "../../../types/typesMedia";

export async function fuegoDiaryGet(
  key: string,
  uid: string,
  cursor: string,
  mediaTypes: MediaType[] | null,
  rating: number | null,
  releasedDecade: number | null,
  diaryYear: number | null,
  loggedBefore: boolean | null,
  genre: string | null
): Promise<MediaDiaryWithId[]> {
  // using this I'm able to filter based on this type and then I'll able to manipulate how they're displayed?
  let diaryRef = fuegoDb.collection(
    `users/${uid}/diary`
  ) as fuego.firestore.Query;

  if (mediaTypes !== null) {
    diaryRef = diaryRef.where("type", "in", mediaTypes);
  }

  if (rating !== null) {
    diaryRef = diaryRef.where("rating", "==", rating);
  }

  if (releasedDecade !== null) {
    diaryRef = diaryRef.where("releasedDecade", "==", releasedDecade);
  }

  if (diaryYear !== null) {
    diaryRef = diaryRef.where("diaryYear", "==", diaryYear);
  }

  if (loggedBefore !== null) {
    diaryRef = diaryRef.where("loggedBefore", "==", loggedBefore);
  }

  if (genre !== null) {
    diaryRef = diaryRef.where("genre", "==", genre);
  }

  diaryRef = diaryRef.where("diaryDate", "!=", null);
  diaryRef = diaryRef.orderBy("diaryDate", "desc");

  if (cursor !== null) {
    diaryRef = diaryRef.startAfter(cursor);
  }

  const diaryItems = await diaryRef.limit(30).get();

  const items: MediaDiaryWithId[] = [];
  diaryItems.forEach((item) => {
    items.push(item.data() as MediaDiaryWithId);
  });

  return items;
}
