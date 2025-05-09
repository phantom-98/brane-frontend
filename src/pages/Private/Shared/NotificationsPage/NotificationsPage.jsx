import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

import "./NotificationsPage.scss";

import InstitutionHeader from "../../../../components/CustomHeaders/InstitutionHeader";
import InstructorHeader from "../../../../components/CustomHeaders/InstructorHeader";
import BusinessHeader from "../../../../components/CustomHeaders/BusinessHeader";
import InternalHeader from "../../../../components/InternalHeader/InternalHeader";
import PageTransition from "../../../../components/PageTransition/PageTransition";
import HeaderToggler from "../../../../components/HeaderToggler/HeaderToggler";
import SpinnerOfDoom from "../../../../components/SpinnerOfDoom/SpinnerOfDoom";
import Notification from "../../../../components/Notification/Notification";
import Footer from "../../../../components/Footer/Footer";
import { UserDataContext } from "../../../../contexts/UserDataContext";
import { getNotifications } from "../../../../api/getNotifications";
import { DictionaryContext } from "../../../../contexts/DictionaryContext";

const NotificationsPage = () => {
  const { dictionary, language } = useContext(DictionaryContext);
  const { userData } = useContext(UserDataContext);

  const [notifications, setNotifications] = useState(null);

  useEffect(() => {
    const getAllNotifications = async () => {
      const { ok, data } = await getNotifications();

      if (ok) {
        console.log(data);
        if (!data.hasOwnProperty("message")) {
          const sorted = data.sort((a, b) => a.updatedAt < b.updatedAt);

          setNotifications(sorted);
        } else {
          setNotifications([]);
        }
      } else {
        toast.error(`${data.error.message}`);
      }
    };

    getAllNotifications();
  }, []);

  return (
    <div id="notifications-page" className="page">
      <PageTransition {...(!userData.company && { margin: true })}>
        {userData.company ? (
          <BusinessHeader />
        ) : userData.institution ? (
          <InstitutionHeader />
        ) : userData.mode !== "instructor" ? (
          <HeaderToggler>
            <InternalHeader
              options={{
                backButton: true,
                bigTitle: true,
              }}
              title={dictionary.notificationsPage[0][language]}
            />
          </HeaderToggler>
        ) : (
          <InstructorHeader />
        )}

        <div className="main">
          <div className="title">
            <h1>{dictionary.notificationsPage[0][language]}</h1>
          </div>

          {notifications ? (
            notifications.length !== 0 ? (
              notifications.map((notification, index) => {
                return <Notification {...notification} key={index} />;
              })
            ) : (
              <p className="no-data">
                {dictionary.notificationsPage[1][language]}
              </p>
            )
          ) : (
            <SpinnerOfDoom standalone center />
          )}
        </div>

        <Footer
          unique
          {...(userData.mode === "instructor" && { instructor: true })}
          {...(userData.company && { company: true })}
        />
      </PageTransition>
    </div>
  );
};

export default NotificationsPage;
