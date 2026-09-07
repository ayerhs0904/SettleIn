package com.settlein.backend.repository;

import com.settlein.backend.entity.Listing;
import com.settlein.backend.entity.ListingType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ListingSpecification {

    public static Specification<Listing> filterListings(
            String city,
            ListingType listingType,
            Double minRent,
            Double maxRent
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (city != null && !city.trim().isEmpty()) {
                predicates.add(cb.equal(cb.lower(root.get("city")), city.trim().toLowerCase()));
            }

            if (listingType != null) {
                predicates.add(cb.equal(root.get("listingType"), listingType));
            }

            if (minRent != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("rent"), minRent));
            }

            if (maxRent != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("rent"), maxRent));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
