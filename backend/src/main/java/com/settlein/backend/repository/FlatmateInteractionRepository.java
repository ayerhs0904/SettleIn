package com.settlein.backend.repository;

import com.settlein.backend.entity.FlatmateInteraction;
import com.settlein.backend.entity.InteractionStatus;
import com.settlein.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FlatmateInteractionRepository extends JpaRepository<FlatmateInteraction, Long> {

    Optional<FlatmateInteraction> findByFromUserAndToUser(User fromUser, User toUser);

    List<FlatmateInteraction> findByFromUser(User fromUser);

    List<FlatmateInteraction> findByToUser(User toUser);

    List<FlatmateInteraction> findByFromUserAndStatus(User fromUser, InteractionStatus status);

    List<FlatmateInteraction> findByToUserAndStatus(User toUser, InteractionStatus status);

    @Query("SELECT i.toUser.id FROM FlatmateInteraction i WHERE i.fromUser = :fromUser")
    List<Long> findInteractedUserIdsByFromUser(@Param("fromUser") User fromUser);

    @Query("SELECT i FROM FlatmateInteraction i WHERE i.fromUser = :user AND i.status = 'INTERESTED' AND EXISTS (" +
           "SELECT i2 FROM FlatmateInteraction i2 WHERE i2.fromUser = i.toUser AND i2.toUser = :user AND i2.status = 'INTERESTED')")
    List<FlatmateInteraction> findMutualInterests(@Param("user") User user);
}
