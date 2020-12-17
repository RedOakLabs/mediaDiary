import { StarIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  HStack,
  Image,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import React from "react";
import Rating from "react-rating";
import useSWR from "swr";
import type { DiaryState } from "../config/mediaTypes";
import { useMDDispatch, useMDState } from "../config/store";
import useFuegoUser from "../hooks/useFuegoUser";
import { fuegoDiaryGet } from "../interfaces/fuegoActions";
import AlbumIcon from "./icons/AlbumIcon";
import FilmIcon from "./icons/FilmIcon";
import StarEmptyIcon from "./icons/StartEmptyIcon";
import TvIcon from "./icons/TvIcon";
import MdLoader from "./md/MdLoader";

interface ListState {
  [key: string]: DiaryState;
}

const LIMIT = 30;
const ORDERBY = "diaryDate";
const MEDIATYPESLENGTH = 3;

function MediaDiary(): JSX.Element {
  const { filterBy, page } = useMDState();
  const dispatch = useMDDispatch();
  const { colorMode } = useColorMode();
  const { user } = useFuegoUser();

  const { data, error } = useSWR(
    user && user !== null && typeof user.uid !== "undefined"
      ? ["/api/diary/", user.uid]
      : null,
    fuegoDiaryGet,
    {
      revalidateOnFocus: false,
    }
  );

  // There's an error on the list, or the list is empty
  if (error) {
    return <div>nothing in this list</div>;
  }

  if (data) {
    const currentRange = page * LIMIT;
    const diaryKeys = Object.keys(data.diaryItems);

    const diaryList = diaryKeys.filter((e) =>
      filterBy.length === MEDIATYPESLENGTH
        ? e
        : filterBy.includes(data.diaryItems[e].type)
    );

    const diaryDates: ListState = diaryList
      // .filter((_, i) => i < currentRange && i >= currentRange - LIMIT)
      .reduce<ListState>((a, c) => {
        const dateString = dayjs(data.diaryItems[c].diaryDate).format(
          "YYYY-MM"
        );
        a[dateString] = Object.assign(
          { ...a[dateString] },
          { [c]: data.diaryItems[c] }
        );
        return a;
      }, {});

    // .sort((a, b) => (new Date(a) > new Date(b) ? -1 : 1))
    return (
      <>
        {Object.keys(diaryDates)
          .reverse()
          .map((month, monthIndex) => {
            return (
              <Grid
                templateColumns={{
                  base: "3rem 1fr",
                  md: "0.1fr 0.9fr",
                }}
                key={monthIndex}
                borderLeftWidth={{ base: 0, md: "1px" }}
                borderRightWidth={{ base: 0, md: "1px" }}
                px={{ md: 8 }}
              >
                <Box>
                  <Text
                    fontSize={{ base: "lg", md: "2xl" }}
                    color={colorMode === "light" ? "gray.600" : "gray.300"}
                    fontWeight="bold"
                    position="sticky"
                    top="4rem"
                  >
                    {dayjs(`${month}-01`).format("MMM")}
                    {/* {new Date(month).toLocaleDateString("en-us", {
                      month: "short",
                    })} */}
                  </Text>
                </Box>
                <Box>
                  {Object.keys(diaryDates[month])
                    .reverse()
                    // .sort((a, b) => {
                    //   const aDate = new Date(diaryDates[month][a].diaryDate);
                    //   const bDate = new Date(diaryDates[month][b].diaryDate);
                    //   return aDate > bDate ? -1 : 1;
                    // })
                    .map((day, dayIndex) => {
                      const {
                        rating,
                        title,
                        poster,
                        releasedDate,
                        artist,
                        type,
                        season,
                        seenEpisodes,
                      } = diaryDates[month][day];
                      return (
                        <Grid
                          gridTemplateColumns={{
                            base: "1.5rem 4rem 1fr",
                            md: "3rem 7rem 1fr",
                          }}
                          gridGap="1rem"
                          borderBottomWidth="1px"
                          px={3}
                          py={{ base: 4, md: 5 }}
                          key={monthIndex + dayIndex}
                          _hover={{
                            bg:
                              colorMode === "light" ? "purple.50" : "gray.700",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            dispatch({
                              type: "day",
                              payload: {
                                diaryId: day,
                                diary: diaryDates[month][day],
                              },
                            })
                          }
                        >
                          <Box>
                            <Text
                              fontSize={{ base: "lg", md: "xl" }}
                              color={
                                colorMode === "light" ? "gray.500" : "gray.300"
                              }
                            >
                              {new Date(
                                diaryDates[month][day].diaryDate
                              ).toLocaleDateString("en-us", {
                                day: "numeric",
                              })}
                            </Text>
                          </Box>
                          <Box>
                            <Image
                              src={poster}
                              ignoreFallback
                              borderRadius="5px"
                              border="1px solid"
                              borderColor="gray.300"
                            />
                          </Box>
                          <Flex flexDirection="column">
                            <Text fontSize={{ base: "md", md: "xl" }}>
                              {title}
                            </Text>
                            <Text
                              fontSize={{ base: "sm" }}
                              color="gray.500"
                              pb={2}
                            >
                              {new Date(releasedDate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                }
                              )}
                              <Text as="span" px={2}>
                                ·
                              </Text>
                              {artist}
                            </Text>
                            {type === "tv" && (
                              <Flex
                                py={2}
                                fontSize="sm"
                                color="gray.500"
                                fontStyle="italic"
                              >
                                <Text>
                                  <Text as="span" fontWeight="semibold">
                                    S:{" "}
                                  </Text>
                                  {season}
                                </Text>
                                {typeof seenEpisodes !== "undefined" &&
                                  seenEpisodes?.length > 0 && (
                                    <>
                                      <Text px={2}>·</Text>
                                      <Text>
                                        <Text as="span" fontWeight="semibold">
                                          Ep.{" "}
                                        </Text>
                                        {seenEpisodes
                                          ?.sort((a, b) => (a < b ? -1 : 1))
                                          .join(", ")}
                                      </Text>
                                    </>
                                  )}
                              </Flex>
                            )}
                            <Flex
                              mt="auto"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <Box mt={type === "tv" ? "-3px" : undefined}>
                                {rating === 0 ? (
                                  <Text fontSize="sm" color="gray.500">
                                    No Rating
                                  </Text>
                                ) : (
                                  <Rating
                                    fractions={2}
                                    readonly
                                    initialRating={rating}
                                    fullSymbol={
                                      <StarIcon
                                        h={{ base: "12px", md: "20px" }}
                                        w={{ base: "12px", md: "20px" }}
                                        color="purple.400"
                                      />
                                    }
                                    emptySymbol={
                                      <StarEmptyIcon
                                        h={{ base: "12px", md: "20px" }}
                                        w={{ base: "12px", md: "20px" }}
                                        stroke="purple.400"
                                      />
                                    }
                                  />
                                )}
                              </Box>
                              {type === "movie" && <FilmIcon />}
                              {type === "album" && <AlbumIcon />}
                              {type === "tv" && <TvIcon />}
                            </Flex>
                          </Flex>
                        </Grid>
                      );
                    })}
                </Box>
              </Grid>
            );
          })}
        <Center py={4}>
          <HStack spacing="24px">
            {new Array(Math.ceil(diaryList.length / LIMIT))
              .fill(null)
              .map((_, i) => (
                <Button
                  key={`pagination_${i}`}
                  onClick={() => {
                    dispatch({
                      type: "state",
                      payload: {
                        key: "page",
                        value: i + 1,
                      },
                    });
                    return window.scrollTo({ top: 0 });
                  }}
                >
                  {i + 1}
                </Button>
              ))}
          </HStack>
        </Center>
      </>
    );
  }

  return <MdLoader />;
}

export default MediaDiary;
