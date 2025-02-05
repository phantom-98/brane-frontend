import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";

import { ChevronForward } from "../../../assets/icons";
import { DictionaryContext } from "../../../contexts/DictionaryContext";

const Article = () => {
  let location = useLocation();
  let blog = location.pathname.split("/", 2)[1] === "blog";

  const { dictionary, language } = useContext(DictionaryContext);

  return (
    <div className="help-article">
      <Link to={blog ? "/blog" : "/help"} className="small-button return">
        <ChevronForward /> {dictionary.blog[4][language]}
      </Link>

      <h2>{blog ? dictionary.blog[0][language] : dictionary.blog[3][language]}</h2>

      <p>
        {`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

        At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.`}
      </p>
    </div>
  );
};

export default Article;
