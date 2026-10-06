package com.settlein.backend.repository;

import com.settlein.backend.entity.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long>, JpaSpecificationExecutor<Listing> {

    @Query("SELECT AVG(l.rent) FROM Listing l WHERE LOWER(l.city) = LOWER(:city)")
    Double findAverageRentByCity(@Param("city") String city);

    @Query("SELECT AVG(l.rent) FROM Listing l WHERE LOWER(l.city) = LOWER(:city) AND l.id != :excludeId")
    Double findAverageRentByCityExcludingId(@Param("city") String city, @Param("excludeId") Long excludeId);

    @Query("SELECT DISTINCT l FROM Listing l JOIN l.images img WHERE img IN :imageUrls AND l.owner.id != :ownerId")
    List<Listing> findListingsWithDuplicateImages(@Param("imageUrls") List<String> imageUrls, @Param("ownerId") Long ownerId);
}
