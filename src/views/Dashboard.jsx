import React from "react";
import PropTypes from "prop-types";
// import { formatTimeAgo } from "../lib/data"; 

export default function Dashboard({ cache, onNavigate }) {
  const contentStats = [
    { title: "Poetry",   view: "kalaam",   count: cache?.kalaam?.length   || 0, icon: "journal-richtext",  color: "text-emerald-400" },
    { title: "Articles", view: "articles", count: cache?.articles?.length || 0, icon: "file-text-fill",   color: "text-cyan-400" },
    { title: "Books",    view: "books",    count: cache?.books?.length    || 0, icon: "book-fill",         color: "text-violet-400" },
    { title: "Writers",  view: "poets",    count: cache?.poets?.length    || 0, icon: "people-fill",       color: "text-rose-400" },
  ];

  const orgStats = [
    { title: "Book Folders",   view: "bookFolders",  count: cache?.bookFolders?.length || 0, icon: "folder2-open",     color: "text-yellow-400" },
    { title: "Groups",         view: "groups",       count: cache?.groups?.length      || 0, icon: "collection-fill",   color: "text-amber-400" },
    { title: "Categories",     view: "categories",   count: cache?.categories?.length  || 0, icon: "folder-fill",       color: "text-pink-400" },
    { title: "Topics",         view: "topics",       count: cache?.topics?.length      || 0, icon: "hash",              color: "text-lime-400" },
  ];

  const allItems = [];
  const contentKeys = ["kalaam", "articles", "books", "poets"];

  contentKeys.forEach((key) => {
    const items = cache?.[key];
    if (items?.length) {
      items.forEach((item) => {
        allItems.push({
          ...item,
          itemType:
            key === "kalaam" ? "Poetry" :
            key === "poets"  ? "Writer" :
            key.charAt(0).toUpperCase() + key.slice(1),
          itemIcon:
            key === "kalaam"   ? "journal-richtext" :
            key === "poets"    ? "people-fill" :
            key === "articles" ? "file-text-fill" :
            "book-fill",
          itemIconColor:
            key === "kalaam"   ? "text-emerald-400" :
            key === "poets"    ? "text-rose-400" :
            key === "articles" ? "text-cyan-400" :
            "text-violet-400",
          view: key,
        });
      });
    }
  });

  const recentItems = allItems
    .filter((x) => !!x?.createdAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const maxCount = Math.max(...contentStats.map((d) => d.count), 1);

  return (
    <div>
      <h1 className="mb-1">Welcome Back!</h1>
      <p className="text-slate-600 mb-6">
        Here's a summary of your academy's content and organization.
      </p>

      <div className="space-y-6">
        {/* Content Overview */}
        <div className="bg-white rounded-xl shadow p-5 border border-slate-200/80">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-slate-900">Content Overview</h2>
            <button
              onClick={() => onNavigate("kalaam")}
              className="text-sm text-indigo-600 hover:underline"
            >
              Add New Poetry +
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {contentStats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow p-4 flex flex-col justify-between transition-all duration-300 border border-slate-200/80 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-slate-800">{stat.title}</h3>
                    <p className="text-3xl text-slate-900 mt-2">{stat.count}</p>
                  </div>
                  <div className="p-2.5 bg-slate-100 rounded-lg">
                    <i className={`bi bi-${stat.icon} text-xl ${stat.color}`} />
                  </div>
                </div>
                <button
                  onClick={() => onNavigate(stat.view)}
                  className="cursor-pointer mt-4 w-full text-center px-3 py-1.5 text-xs text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 transition-colors duration-200"
                >
                  View &amp; Manage
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Org Overview */}
        <div className="bg-white rounded-xl shadow p-5 border border-slate-200/80">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-slate-900">Organization Overview</h2>
            <button
              onClick={() => onNavigate("topics")}
              className="text-sm text-indigo-600 hover:underline"
            >
              Add New Topic +
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {orgStats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow p-4 flex flex-col justify-between transition-all duration-300 border border-slate-200/80 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-slate-800">{stat.title}</h3>
                    <p className="text-3xl text-slate-900 mt-2">{stat.count}</p>
                  </div>
                  <div className="p-2.5 bg-slate-100 rounded-lg">
                    <i className={`bi bi-${stat.icon} text-xl ${stat.color}`} />
                  </div>
                </div>
                <button
                  onClick={() => onNavigate(stat.view)}
                  className="cursor-pointer mt-4 w-full text-center px-3 py-1.5 text-xs text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 transition-colors duration-200"
                >
                  View &amp; Manage
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent + Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow p-5 border border-slate-200/80">
            <h2 className="text-slate-900 mb-4">Recent Activity</h2>

            {recentItems.length > 0 ? (
              <ul className="divide-y divide-slate-200">
                {recentItems.map((item, index) => {
                  const title = item.title || item.name || "Untitled";
                  return (
                    <li key={index} className="flex items-center gap-4 py-3">
                      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full">
                        <i className={`bi bi-${item.itemIcon} text-lg ${item.itemIconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-800 truncate">
                          {item.itemType}: {title}
                        </p>
                        <p className="text-xs text-slate-500">
                          Added {formatTimeAgo(item.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => onNavigate(item.view)}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        View
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-center py-8 text-sm text-slate-500">No recent activity.</p>
            )}
          </div>

          {/* Content Distribution */}
          <div className="bg-white rounded-xl shadow p-5 border border-slate-200/80">
            <h2 className="text-slate-900 mb-4">Content Distribution</h2>
            <div className="space-y-3">
              {contentStats.map((stat, index) => (
                <div key={index} className="grid grid-cols-4 items-center gap-2 text-sm">
                  <div className="text-slate-600">{stat.title}</div>
                  <div className="col-span-3 bg-slate-100 rounded-full h-6">
                    <div
                      className="bg-indigo-500 h-6 rounded-full flex items-center justify-between px-2 text-white text-xs"
                      style={{ width: `${(stat.count / maxCount) * 100}%` }}
                    >
                      <span>{stat.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* /Recent + Distribution */}
      </div>
    </div>
  );
}

Dashboard.propTypes = {
  cache: PropTypes.shape({
    kalaam: PropTypes.array,
    articles: PropTypes.array,
    books: PropTypes.array,
    poets: PropTypes.array,
    bookFolders: PropTypes.array,
    groups: PropTypes.array,
    categories: PropTypes.array,
    topics: PropTypes.array,
  }),
  onNavigate: PropTypes.func.isRequired,
};

Dashboard.defaultProps = {
  cache: {
    kalaam: [],
    articles: [],
    books: [],
    poets: [],
    bookFolders: [],
    groups: [],
    categories: [],
    topics: [],
  },
};
