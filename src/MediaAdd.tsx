import * as React from "react";
import { useEffect, useState, useReducer } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Collapse from "@material-ui/core/Collapse";
import Divider from "@material-ui/core/Divider";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import FavoriteIcon from "@material-ui/icons/Favorite";
import PersonPinIcon from "@material-ui/icons/PersonPin";
import SearchIcon from "@material-ui/icons/Search";
import Skeleton from "@material-ui/lab/Skeleton";
import { MBDKEY } from "./config/constants";
import { MediaTypes, MediaSelected, MediaTyper } from "./config/storeMedia";
import useDebounce from "./hooks/useDebounce";
import { useStoreActions, useStoreState } from "./config/store";

interface MediaSearchListProps extends MediaTypes {
  item: any;
  children(props: { name: string; artist: string; date: Date }): JSX.Element;
}

const MediaSearchList = ({ type, item, children }: MediaSearchListProps) => {
  let name;
  let artist;
  let date;

  if (type === "film") {
    name = item.title;
    artist = "";
    date = item.release_date;
  } else if (type === "tv") {
    name = item.original_name;
    artist = "";
    date = item.first_air_date;
  } else if (type === "album") {
    name = item.artistName;
    artist = item.collectionName;
    date = item.releaseDate;
  }

  return children({
    name: name,
    artist: artist,
    date: date
  });
};

const useStyles = makeStyles(theme => ({
  card: {
    width: theme.breakpoints.values.sm
  },
  mediaResults: {
    overflow: "scroll",
    maxHeight: "32vh"
  }
}));

type StateType = {
  expanded: boolean;
  searchInput: string;
  mediaResult: Array<string>;
  isSearching: boolean;
  type: MediaTyper;
};

type ActionType = {
  type: "hasResults" | "isSearching" | "noResults" | "setType" | "searchInput";
  payload?: any;
};

const MediaAddReducer = (state: StateType, action: ActionType) => {
  switch (action.type) {
    case "hasResults": {
      return {
        ...state,
        isSearching: false,
        expanded: true,
        mediaResult: action.payload
      };
    }
    case "isSearching": {
      return {
        ...state,
        isSearching: true
        // mediaResult: []
      };
    }
    case "searchInput": {
      return {
        ...state,
        searchInput: action.payload
      };
    }
    case "noResults": {
      return {
        ...state,
        isSearching: false,
        expanded: false
      };
    }
    case "setType": {
      return {
        ...state,
        type: action.payload,
        isSearching: true,
        expanded: true
      };
    }
    default:
      return state;
  }
};

// const [type, setType] = useState<MediaTypes["type"]>("film");

const MediaAdd = () => {
  const mediaSelect = useStoreActions(actions => actions.media.mediaSelect);
  const mediaSelected = useStoreState(state => state.media.mediaSelected);
  const classes = useStyles();
  const [
    { expanded, searchInput, mediaResult, isSearching, type },
    dispatch
  ] = useReducer(MediaAddReducer, {
    expanded: false,
    searchInput: "",
    mediaResult: [],
    isSearching: false,
    type: "film"
  });
  const bouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    if (bouncedSearch) {
      handleFetch(type, encodeURIComponent(bouncedSearch))
        .then((r: Response) => r.json())
        .then((res: any) => {
          if (res.results.length === 0) {
            console.log("happens?");
            dispatch({ type: "noResults" });
          } else {
            console.log("happens2?");
            dispatch({ type: "hasResults", payload: res.results });
          }
        });
    } else {
      dispatch({ type: "noResults" });
    }
  }, [bouncedSearch, type]);

  return (
    <Card className={classes.card}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <Typography variant="h5" component="h1">
              Media Search{" "}
            </Typography>
            <Divider orientation="vertical" />

            <IconButton
              aria-label="toggle password visibility"
              onClick={() => dispatch({ type: "setType", payload: "film" })}
              color={type === "film" ? "primary" : "secondary"}
            >
              <PersonPinIcon />
            </IconButton>
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => dispatch({ type: "setType", payload: "tv" })}
              color={type === "tv" ? "primary" : "secondary"}
            >
              <FavoriteIcon />
            </IconButton>
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => dispatch({ type: "setType", payload: "album" })}
              color={type === "album" ? "primary" : "secondary"}
            >
              <FavoriteIcon />
            </IconButton>
          </Box>
          <Box>
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => dispatch({ type: "setType", payload: "film" })}
              color={type === "film" ? "primary" : "secondary"}
            >
              X
            </IconButton>
          </Box>
        </Box>
        <Box my={2} />
        <TextField
          fullWidth
          autoFocus
          variant="outlined"
          id="input-with-icon-textfield"
          label={`Search for ${type}`}
          onChange={e =>
            dispatch({ type: "searchInput", payload: e.target.value })
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
        <Collapse in={expanded} timeout="auto">
          <Box className={classes.mediaResults}>
            <Table>
              <TableBody>
                {mediaResult.map((e: any, i: number) => (
                  <MediaSearchList key={type + i} type={type} item={e}>
                    {({ name, artist, date }) => (
                      <TableRow
                        hover
                        onClick={() => mediaSelect(mediaNormalize(e))}
                      >
                        <TableCell>
                          {isSearching ? (
                            <Skeleton animation="wave" />
                          ) : name && artist !== "" ? (
                            `${name} - ${artist}`
                          ) : (
                            name
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {date &&
                            ` (${new Date(date).toLocaleDateString("en-us", {
                              year: "numeric"
                            })})`}
                        </TableCell>
                      </TableRow>
                    )}
                  </MediaSearchList>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );

  // Will return promise with appropriate film information
  function handleFetch(searchType: string, search: string) {
    let URL = "";
    if (searchType === "film") {
      URL = `https://api.themoviedb.org/3/search/movie?api_key=${MBDKEY}&language=en-US&query=${search}&page=1&include_adult=false`;
    } else if (searchType === "tv") {
      URL = `https://api.themoviedb.org/3/search/tv?api_key=${MBDKEY}&language=en-US&query=${search}&page=1`;
    } else if (searchType === "album") {
      // URL = `http://ws.audioscrobbler.com/2.0/?method=album.search&album=${search}&api_key=${MBDKEY}&limit=15&format=json`;
      URL = `https://itunes.apple.com/search?term=${search}&entity=album`;
    }
    return fetch(URL);
  }

  function mediaNormalize(item: any) {
    let id, poster, title, published, overview, watched, artist, mbid;
    if (type === "film") {
      id = item.id.toString();
      poster = `https://image.tmdb.org/t/p/w400/${item.poster_path}`;
      title = item.title;
      published = item.release_date;
      overview = item.overview;
      artist = typeof item.director !== "undefined" && item.director;
      watched = "Watched";
    } else if (type === "tv") {
      id = item.id.toString();
      poster = `https://image.tmdb.org/t/p/w400/${item.poster_path}`;
      title = item.name;
      published = item.first_air_date;
      overview = item.overview;
      artist = typeof item.creator !== "undefined" && item.creator;
      watched = "Watched";
    } else if (type === "album") {
      id = encodeURIComponent(item.artistName + item.collectionName);
      poster = item.artworkUrl100.replace("100x100", "1000x1000");
      title = item.collectionName;
      artist = item.artistName;
      published = item.releaseDate;
      overview = "";
      watched = "Listened To";
    }
    const mediaReturn: MediaSelected = {
      id,
      poster,
      title,
      published,
      overview,
      watched,
      artist
    };
    return mediaReturn;
  }
};
export default MediaAdd;

{
  /* <MediaSearch type={type} /> */
}
// {mediaSelected.id !== "" ? (
//   <MediaLog type={type} setType={setType} />
// ) : (
// )}

// <Flex
//         alignItems="center"
//         justifyContent="flex-end"
//         mr={3}
//         borderRight="1px solid var(--border-primary)"
//       >
//         <Text fontSize={3} mr={3} fontWeight={300} color="blue">
//           Add:
//         </Text>
//         <Icon
//           name="film"
//           stroke="primary"
//           height="20px"
//           width="20px"
//           onClick={() => setType("film")}
//           mr={3}
//         />
//         <Icon
//           name="tv"
//           stroke="primary"
//           height="20px"
//           width="20px"
//           onClick={() => setType("tv")}
//           mr={3}
//         />
//         <Icon
//           name="album"
//           stroke="primary"
//           height="20px"
//           width="20px"
//           onClick={() => setType("album")}
//           mr={3}
//         />
//       </Flex>
