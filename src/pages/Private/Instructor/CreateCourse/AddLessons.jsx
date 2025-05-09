import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import SpinnerOfDoom from "../../../../components/SpinnerOfDoom/SpinnerOfDoom";
import LessonAggregator from "../EditCourse/LessonAggregator";
import { getLessonsByCourseID } from "../../../../api/getLessonsByCourseID";
import { DictionaryContext } from "../../../../contexts/DictionaryContext";
import { putCourse } from "../../../../api/putCourse";

const AddLessons = ({ courseID = 14 }) => {
  const { dictionary, language } = useContext(DictionaryContext);

  const navigate = useNavigate();

  const [lessons, setLessons] = useState(null);
  const [updater, setUpdater] = useState(null);

  // ------------------- Get info

  const getLessons = async () => {
    const { ok, data } = await getLessonsByCourseID(courseID);

    if (ok) {
      setLessons(data.data);
    } else {
      toast.error(`${data.error.message}`);
    }
  };

  // Get course lessons
  useEffect(() => {
    if (courseID) {
      getLessons();
    }
  }, [courseID, updater]); //eslint-disable-line

  // ------------------ Publish course

  const [requesting, setRequesting] = useState(false);

  const checkLessons = () => {
    setRequesting(true);

    const updateCourseStatus = async () => {
      const obj = {
        data: {
          status: "published",
        },
      };

      const { ok, data } = await putCourse(courseID, obj);

      if (ok) {
        toast.success(dictionary.privateInstructor.addLessons[0][language]);
        setRequesting(false);
        navigate("/my-courses");
      } else {
        toast.error(`${data.error.message}`);
      }
    };

    const getLessons = async () => {
      const { ok, data } = await getLessonsByCourseID(courseID);

      if (ok) {
        const lessons = data.data;

        if (lessons.length > 0) {
          const error = lessons.filter((lesson) => lesson.attributes.clase.data === null);

          if (error.length === 0) {
            updateCourseStatus();
          } else {
            console.log(error);
            toast.error(dictionary.privateInstructor.addLessons[1][language]);
            setRequesting(false);
          }
        } else {
          toast.error(dictionary.privateInstructor.addLessons[2][language]);
          setRequesting(false);
        }
      } else {
        toast.error(`${data.error.message}`);
        setRequesting(false);
      }
    };

    getLessons();
  };

  return (
    <div className="instructor-course-lessons">
      <h1>{dictionary.privateInstructor.addLessons[3][language]}</h1>

      <div className="section">
        <LessonAggregator courseID={courseID} setUpdater={setUpdater} />
      </div>

      {lessons && (
        <div className="section">
          <h2>{dictionary.privateInstructor.addLessons[4][language]}</h2>
          {lessons.map((lesson, index) => {
            return (
              <div className="individual" key={index}>
                <strong>{`# ${index + 1}: `}</strong>

                <p>{lesson.attributes.nombre}</p>
              </div>
            );
          })}
        </div>
      )}

      {lessons && lessons.length > 0 && (
        <div className="section final">
          <h2>{dictionary.privateInstructor.addLessons[5][language]}</h2>

          <button className="action-button extended" onClick={checkLessons} disabled={requesting}>
            {requesting ? (
              <>
                <SpinnerOfDoom />
                {dictionary.privateInstructor.addLessons[6][language]}
              </>
            ) : (
              dictionary.privateInstructor.addLessons[7][language]
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default AddLessons;
