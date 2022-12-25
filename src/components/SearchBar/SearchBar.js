import { memo, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { InputBase, Paper, IconButton, Divider } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import styled from "@emotion/styled";
import queryString from "query-string";

const SearchBarPaper = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'stretch',
  marginBottom: 3,
  border: '1px solid',
  borderColor: theme.palette.control.dark,
}));

export const SearchBar = memo(({ sx, placeholder, fontSize }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, resetField, watch, setValue } = useForm();

  const query = queryString.parse(location.search);

  const onSubmit = useCallback((data) => {
      if (!data.search_query) return;
      let queryStr = "";
      query.search_query = data.search_query;
      Object.keys(query).forEach((key, index) => {
        if (key === "page") return;
        if (queryStr !== "") queryStr += "&";
        queryStr += key + "=" + query[key];
      });
      navigate({
        pathname: location.pathname,
        search: queryStr
      });
  }, [navigate, location.pathname, query]);

  const onReset = useCallback(() => {
    resetField('search_query');
    let queryStr = "";
    delete query.search_query;
    Object.keys(query).forEach((key, index) => {
      if (key === "page") return;
      if (queryStr !== "") queryStr += "&";
      queryStr += key + "=" + query[key];
    });
    navigate({
      pathname: location.pathname,
      search: queryStr
    });
  }, [navigate, resetField, location.pathname, query]);

  useEffect(() => {
    if (query.search_query && typeof query.search_query === 'string') {
      setValue('search_query', query.search_query);
    }
  }, [query.search_query, setValue]);

  return (
    <SearchBarPaper
      component="form"
      variant="outlined"
      onSubmit={handleSubmit(onSubmit)}
      sx={sx}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder={placeholder}
        {...register('search_query')}
      />
      {watch().search_query ? (
        <IconButton
          sx={{ p: '10px' }}
          disableRipple={true}
          onClick={onReset}
        >
          <ClearIcon />
        </IconButton>
      ) : null}
      <Divider sx={{ height: 25, mt: 0.5, mb: 0.5, mr: 0.5 }} orientation="vertical" />
      <IconButton
        type="submit"
        color="primary"
      >
        <SearchIcon />
      </IconButton>
    </SearchBarPaper>
  )
});