import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  Heading,
  IconButton,
  Image,
  SimpleGrid,
  Tag,
  Text,
  VStack,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import React from "react";
import { MDB_IMGURL } from "../../../config/contants";
import type { MDbMovie } from "../../../types/typesMDb";
import type { SpotifyAlbum, SpotifyArtist } from "../../../types/typesSpotify";
import { createPosterURL, parsePosterUrl } from "../../../utils/helpers";

interface Props {
  data: MDbMovie;
}

export default function SelectedMovie({ data }: Props): JSX.Element {
  const {
    credits,
    genres,
    title,
    poster_path,
    release_date,
    tagline,
    overview,
  } = data;
  const artist =
    credits &&
    credits.crew &&
    credits.crew.find((e) => e.job === "Director")?.name;

  console.log(data);

  return (
    <>
      <Flex
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        textAlign="center"
      >
        <Text fontSize="lg">{artist}</Text>
        <Heading
          fontWeight="bold"
          fontStyle="italic"
          size="lg"
          lineHeight={1.3}
        >
          {title}
        </Heading>
      </Flex>
      <Grid
        gridTemplateColumns="1fr 1fr"
        gridGap="1.5rem"
        justifyContent="center"
        mt={6}
      >
        <Box ml={{ base: 0, sm: 12 }}>
          <Image
            src={createPosterURL(parsePosterUrl(poster_path, "movie"), "movie")}
            borderRadius="5px"
            border="1px solid"
            borderColor="gray.300"
            loading="eager"
          />
        </Box>
        <VStack spacing="6" justify="center" align="left">
          <Box>
            <Text fontWeight={500} fontSize="sm">
              Released
            </Text>
            <Text fontWeight="bold" fontSize="lg">
              {typeof release_date !== "undefined" &&
                `${new Date(release_date).toLocaleDateString("en-us", {
                  year: "numeric",
                })}`}
            </Text>
          </Box>
          <Box>
            <Text fontWeight={500} fontSize="sm">
              Genre
            </Text>
            <Text fontWeight="bold" fontSize="lg">
              {genres && genres[0].name}
            </Text>
          </Box>
          {/* <Box>
            <Text fontWeight={500} fontSize="sm">
              Label
            </Text>
            <Text fontWeight="bold" fontSize="lg">
              {label}
            </Text>
          </Box> */}
          <Flex
            justify="space-between"
            direction={{ sm: "column", md: "initial" }}
          >
            {/* <Button
              as="a"
              href={artistInfo.external_urls.spotify}
              target="_blank"
              size="sm"
              rightIcon={<ExternalLinkIcon />}
            >
              Artist Page
            </Button>
            <Button
              href={albumInfo.external_urls.spotify}
              as="a"
              target="_blank"
              size="sm"
              rightIcon={<ExternalLinkIcon />}
            >
              Album Page
            </Button> */}
          </Flex>
        </VStack>
      </Grid>
      {overview && (
        <>
          <Heading size="lg" mb={3}>
            About
          </Heading>
          <Text
            textTransform="uppercase"
            pb={2}
            fontSize="sm"
            fontWeight={400}
            color="gray.500"
          >
            {tagline}
          </Text>
          <Text>{overview}</Text>
          <Divider mt={4} mb={4} />
        </>
      )}
      {data.credits && data.credits.cast && (
        <>
          <Heading size="lg" mb={5}>
            Cast
          </Heading>
          <SimpleGrid columns={{ base: 2, sm: 4 }} gap={{ base: 10, sm: 4 }}>
            {data.credits.cast.slice(0, 4).map((e) => (
              <Box
                maxW="sm"
                boxShadow="md"
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                as="a"
                href={`https://www.themoviedb.org/person/${e.id}`}
                target="_blank"
                key={e.name}
              >
                {e.profile_path !== null && (
                  <Image src={`${MDB_IMGURL}w200${e.profile_path}`} />
                )}
                <Box px={3} py={3}>
                  <Text fontWeight="bold" isTruncated>
                    {e.name}
                  </Text>
                  {e.character && <Text>{e.character}</Text>}
                </Box>
              </Box>
            ))}
          </SimpleGrid>
          <Divider mt={4} mb={4} />
        </>
      )}
    </>
  );
}
