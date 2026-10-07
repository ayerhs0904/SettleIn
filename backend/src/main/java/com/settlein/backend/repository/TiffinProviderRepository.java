package com.settlein.backend.repository;

import com.settlein.backend.entity.TiffinProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TiffinProviderRepository extends JpaRepository<TiffinProvider, Long> {

    List<TiffinProvider> findByCityIgnoreCase(String city);

    @Query("SELECT p FROM TiffinProvider p WHERE " +
           "(:area IS NULL OR LOWER(p.area) LIKE LOWER(CONCAT('%', :area, '%'))) AND " +
           "(:city IS NULL OR LOWER(p.city) = LOWER(:city)) AND " +
           "(:maxPrice IS NULL OR p.pricePerMonth <= :maxPrice)")
    List<TiffinProvider> filterProviders(
            @Param("area") String area,
            @Param("city") String city,
            @Param("maxPrice") Double maxPrice
    );
}
