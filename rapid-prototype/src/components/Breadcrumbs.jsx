import React, { Fragment } from "react";
import { PAGE_HOME } from "../constants";

const Breadcrumbs = ({ paths, dispatch }) => {
  return (
    <div className="container flex items-center px-2 py-4 mx-auto overflow-y-auto whitespace-nowrap mb-8">
      <a
        onClick={() => {
          dispatch({ type: PAGE_HOME });
        }}
        className="text-gray-600 cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      </a>

      {paths.map(({ page, name }) => (
        <Fragment key={page}>
          <span className="mx-5 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>

          {page && (
            <a
              onClick={() => {
                dispatch({ type: page });
              }}
              className="text-gray-600 hover:underline cursor-pointer"
            >
              {name}
            </a>
          )}
          {!page && <h2>{name}</h2>}
        </Fragment>
      ))}
    </div>
  );
};

export default Breadcrumbs;
