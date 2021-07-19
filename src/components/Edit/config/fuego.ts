import {
  fuegoDb,
  createFilterKeys,
  createFilterSet,
  createFilterEditSet,
  bookmarkFilterKeys,
  bookmarkFilterSet,
} from "@/fuego";
import type { MediaDiaryDate } from "@/types";

export async function fuegoEdit(
  uid: string,
  diaryId: string,
  data: MediaDiaryDate,
  prevData: MediaDiaryDate
): Promise<void> {
  const batch = fuegoDb.batch();

  const diaryRef = fuegoDb.collection(`users/${uid}/diary`).doc(diaryId);
  batch.update(diaryRef, { ...data, bookmark: false });

  // We have the following cases
  // Bookmark -> New Diary
  // - Add Diary Filter
  // - if Rating > 0
  //   - Add Memory Filter
  // - Remove bookmark Filter
  // Old Diary -> New Diary
  // - If rating WAS -1 && rating > 0
  //   - Add Memory Filter
  // If rating WAS > 0 &&  rating === -1
  //   - remove Memory Filter
  const filtersRef = fuegoDb.collection(`/users/${uid}/filters`).doc("diary");

  // Bookmark => new Diary
  if (!prevData.diaryYear && data.diaryYear) {
    // add diaryFilter
    const filtersKeys = createFilterKeys(data);
    const setObj = createFilterSet(filtersKeys, 1);
    filtersRef.set(setObj, { merge: true });

    if (prevData.rating === 0 && data.rating > 0) {
      // add memoryFilter
      createMemoryFilter(data, uid, 1);
    }
  }

  // Add Memory Only
  if (!prevData.diaryYear && !data.diaryYear) {
    applyRatingFilter(prevData, data, uid);
  }

  // Old Diary to new Diary
  if (prevData.diaryYear && data.diaryYear) {
    const editObj = createFilterEditSet(data, prevData, [
      "rating",
      "releasedDecade",
      "loggedBefore",
      "diaryYear",
      "releasedYear",
    ]);
    filtersRef.set(editObj, { merge: true });
    applyRatingFilter(prevData, data, uid);
  }

  // If bookmark is present, then we'll remove it from _just_ the bookmark filter.
  // Since we've moved to the diaryFilter
  if (data.bookmark) {
    const bookmarkRef = fuegoDb
      .collection(`/users/${uid}/filters`)
      .doc("bookmarks");
    const bookmarkKeys = bookmarkFilterKeys(data);
    const bookmarkObj = bookmarkFilterSet(bookmarkKeys, -1);
    bookmarkRef.set(bookmarkObj, { merge: true });
  }

  return batch.commit();
}

function applyRatingFilter(
  prevData: MediaDiaryDate,
  data: MediaDiaryDate,
  uid: string
) {
  // add memoryFilter
  if (prevData.rating === 0 && data.rating > 0) {
    createMemoryFilter(data, uid, 1);
  }

  // remove memoryFilter
  if (prevData.rating > 0 && data.rating === 0) {
    createMemoryFilter(data, uid, -1);
  }
}

function createMemoryFilter(data: MediaDiaryDate, uid: string, inc: number) {
  const memoryKeys = bookmarkFilterKeys(data);
  const memoryObj = bookmarkFilterSet(memoryKeys, inc);
  const memoryRef = fuegoDb.collection(`/users/${uid}/filters`).doc("memories");
  memoryRef.set(memoryObj, { merge: true });
}
