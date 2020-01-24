import {
  Box,
  Typography,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  Avatar
} from "@material-ui/core";
import * as React from "react";
import { useEffect, useState } from "react";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import { makeStyles, styled } from "@material-ui/core/styles";
import { useStoreActions, useStoreState } from "./config/store";
import { DataByDate, DataByID } from "./config/storeData";
import { MediaTypes } from "./config/storeMedia";
import Rating from "@material-ui/lab/Rating";
// import AddShoppingCartIcon from "@material-ui/icons/AddShoppingCart";
import StarIcon from "@material-ui/icons/Star";
import StarBorderIcon from "@material-ui/icons/StarBorder";
import EditIcon from "@material-ui/icons/Edit";
import DescriptionIcon from "@material-ui/icons/Description";
import { LiveTv, MusicVideo, MovieOutlined } from "@material-ui/icons";

const useStyles = makeStyles(theme => ({
  image: {
    maxWidth: "100%",
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: "5px"
  },
  tableHeadings: {
    "& > *": {
      textTransform: "uppercase",
      color: theme.palette.grey[500],
      fontSize: theme.typography.button.fontSize
    }
  },
  mediaContainer: {
    gridTemplateColumns: "5rem 1fr",
    gridGap: "1rem",
    display: "grid"
  },
  mediaListContainer: {
    display: "grid",
    gridGap: "1.5rem"
  },
  mediaList: {
    gridTemplateColumns: "3rem 6rem 1fr",
    gridGap: "2rem"
  },
  mediaImage: {
    display: "block",
    maxWidth: "100%",
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: "5px"
  }
}));

const TypedTypography = styled(props => <Typography {...props} />)({
  fontWeight: (props: MediaTypes) =>
    props.type === "film" ? "bolder" : undefined,
  textTransform: (props: MediaTypes) =>
    props.type === "film" || props.type === "tv" ? "uppercase" : undefined,
  fontStyle: (props: MediaTypes) =>
    props.type === "album" ? "italic" : undefined
});

function MediaList() {
  const [data, setData] = useState<[string, DataByDate, DataByID]>();
  const byID = useStoreState(state => state.data.byID);
  const byDate = useStoreState(state => state.data.byDate);
  const dataGet = useStoreActions(actions => actions.data.dataGet);

  const classes = useStyles();

  useEffect(() => {
    dataGet();
  }, [dataGet]);

  if (typeof byID !== "undefined" && typeof byDate !== "undefined") {
    const diaryDates = Object.keys(byDate).reduce<{
      [key: string]: {
        [key: string]: DataByDate;
      };
    }>((a, c) => {
      const dateString = byDate[c].date.toDate().toLocaleDateString("en-us", {
        month: "short",
        year: "numeric"
      });
      a[`01-${dateString}`] = Object.assign(
        { ...a[`01-${dateString}`] },
        { [c]: byDate[c] }
      );
      return a;
    }, {});

    return (
      <>
        <Grid className={classes.tableHeadings} container direction="row">
          <Grid item xs={1}>
            Month
          </Grid>
          <Grid item xs={11}>
            <Grid container spacing={3} alignItems="center">
              <Grid item style={{ width: "5%" }}>
                Day
              </Grid>
              <Grid item style={{ width: "10%" }}>
                Poster
              </Grid>
              <Grid item xs={3}>
                Title
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Box pb={2}>
          <Divider />
        </Box>
        {Object.keys(diaryDates)
          .sort((a, b) => (new Date(a) > new Date(b) ? -1 : 1))
          .map((month, monthIndex) => {
            return (
              <Box className={classes.mediaContainer} key={monthIndex}>
                <Box>
                  <Typography
                    variant="h4"
                    style={{ position: "sticky", top: 0 }}
                  >
                    {new Date(month).toLocaleDateString("en-us", {
                      month: "short"
                    })}
                  </Typography>
                </Box>
                <Box className={classes.mediaListContainer}>
                  {Object.keys(diaryDates[month])
                    .sort(
                      (a, b) =>
                        diaryDates[month][b].date.seconds -
                        diaryDates[month][a].date.seconds
                    )
                    .map((day, dayIndex) => {
                      const { title, poster, published, artist, type } = byID[
                        diaryDates[month][day].id
                      ];
                      const { star, seen } = diaryDates[month][day];
                      return (
                        <Box key={monthIndex + dayIndex}>
                          <Box display="grid" className={classes.mediaList}>
                            <Box textAlign="center">
                              <Typography
                                variant="h6"
                                style={{ marginTop: "0.5rem" }}
                              >
                                {new Date(
                                  diaryDates[month][day].date.toDate()
                                ).toLocaleDateString("en-us", {
                                  day: "numeric"
                                })}
                              </Typography>
                            </Box>
                            <Box>
                              <img
                                className={classes.mediaImage}
                                src={poster}
                              />
                            </Box>
                            <Box display="flex" flexDirection="column">
                              <Box
                                display="flex"
                                justifyContent="space-between"
                              >
                                <Typography>
                                  <Box
                                    component="span"
                                    fontWeight="fontWeightBold"
                                    style={{ textTransform: "uppercase" }}
                                  >
                                    {title}
                                  </Box>
                                </Typography>
                              </Box>
                              <Box display="flex" my={1}>
                                <Typography>
                                  {new Date(published).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric"
                                    }
                                  )}
                                </Typography>
                                <Box mx={1}>
                                  <Typography>·</Typography>
                                </Box>
                                <Typography>{artist}</Typography>
                              </Box>
                              <Box
                                mt="auto"
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <Box display="flex" alignItems="center">
                                  <Rating
                                    name="half-rating"
                                    value={star}
                                    precision={0.5}
                                    size="small"
                                    readOnly
                                    emptyIcon={
                                      <StarBorderIcon fontSize="small" />
                                    }
                                    icon={
                                      <StarIcon
                                        fontSize="small"
                                        color="primary"
                                      />
                                    }
                                  />
                                </Box>
                                <Box>
                                  <Tooltip
                                    title="Show Overview"
                                    placement="left"
                                  >
                                    <IconButton>
                                      <DescriptionIcon />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip
                                    title="Show Overview"
                                    placement="top"
                                  >
                                    <IconButton>
                                      <EditIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>
                            </Box>
                          </Box>
                          <Box pt={3}>
                            <Divider />
                          </Box>
                        </Box>
                      );
                    })}
                </Box>
              </Box>
            );
          })}
      </>
    );
  } else {
    return <div>loading</div>;
  }
}

{
  /* <IconButton color="secondary">
<AddShoppingCartIcon />
</IconButton>
<IconButton color="secondary">
<AddShoppingCartIcon />
</IconButton>
<IconButton color="secondary">
<AddShoppingCartIcon />
</IconButton>
{star}
{seen.toString()} */
}
// {/* <Typography>{published}</Typography> */}

// const TypedTypography = styled(props => <Typography {...props} />)({
//   fontWeight: (props: MediaTypes) =>
//     props.type === "film" ? "bolder" : undefined,
//   textTransform: (props: MediaTypes) =>
//     props.type === "film" || props.type === "tv" ? "uppercase" : undefined,
//   fontStyle: (props: MediaTypes) =>
//     props.type === "album" ? "italic" : undefined
// });

export default MediaList;
