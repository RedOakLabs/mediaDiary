import dayjs from "dayjs";
import React from "react";
import useDataFetch from "../../config/useDataFetch";
import type { MDbTV, MDbMovie } from "../../types/typesMDb";
import type { MediaSelected } from "../../types/typesMedia";
import type { SpotifyAlbum, SpotifyArtist } from "../../types/typesSpotify";
import type { UserFuego } from "../../types/typesUser";
import { parsePosterUrl } from "../../utils/helpers";
import MdLoader from "../md/MdLoader";
import ContentData from "./ContentData";

function ContentSelected({
  item,
  user,
}: {
  item: MediaSelected;
  user: UserFuego;
}): JSX.Element {
  const { data, error, isLoading } = useDataFetch({
    type: item.type,
    firstId: item.mediaId,
    secondId: item.artistId,
  });

  const parsedItem = parseData();

  if (error) {
    return <div>{error}</div>;
  }

  return isLoading || !parsedItem ? (
    <MdLoader />
  ) : (
    <ContentData user={user} {...parsedItem} />
  );

  function parseData(): MediaSelected | false {
    if (data) {
      let parsedObj: Partial<MediaSelected> = {};
      if (item.type === "tv") {
        const castItem = data as MDbTV;

        if (castItem.seasons && castItem.seasons !== null) {
          const seasons = castItem.seasons.sort((_, b) =>
            b.season_number === 0 ? -1 : 1
          );
          const seasonItem = seasons[0];
          parsedObj = {
            seasons,
            season: seasonItem.season_number,
            episodes: seasonItem.episode_count,
            poster:
              castItem.poster_path !== null
                ? parsePosterUrl(castItem.poster_path, item.type)
                : "",
            releasedDate: dayjs(seasonItem.air_date).toISOString(),
          };
        }

        if (castItem.genres) {
          parsedObj = {
            ...parsedObj,
            genre: castItem.genres[0].name,
          };
        }

        if (castItem.created_by && castItem.created_by.length > 0) {
          parsedObj = {
            ...parsedObj,
            artist: castItem.created_by.map((e) => e.name).join(", "),
          };
        }
      } else if (item.type === "movie") {
        const castItem = data as MDbMovie;

        if (castItem.credits.crew) {
          parsedObj = {
            artist:
              castItem.credits.crew.find((e) => e.job === "Director")?.name ??
              item.artist,
          };
        }
        if (castItem.genres) {
          parsedObj = {
            ...parsedObj,
            genre: castItem.genres[0].name,
          };
        }
      } else if (item.type === "album") {
        const castItem = data as [SpotifyAlbum, SpotifyArtist];
        parsedObj = {
          genre: (castItem[1].genres && castItem[1]?.genres[0]) ?? "none",
        };
      }

      return {
        ...item,
        ...parsedObj,
      };
    }
    return false;
  }
}
export default ContentSelected;
