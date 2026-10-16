package com.assessmentportal.controller;

import com.assessmentportal.dto.EventRegistrationResponse;
import com.assessmentportal.model.Event;
import com.assessmentportal.model.EventRegistration;
import com.assessmentportal.model.User;
import com.assessmentportal.repository.EventRegistrationRepository;
import com.assessmentportal.repository.EventRepository;
import com.assessmentportal.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/events")
public class EventController {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final UserRepository userRepository;

    public EventController(
            EventRepository eventRepository,
            EventRegistrationRepository eventRegistrationRepository,
            UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.userRepository = userRepository;
    }

    private static Map<String, Object> mapOf(String k1, Object v1) {
        return Collections.singletonMap(k1, v1);
    }

    private static Map<String, Object> mapOf(String k1, Object v1, String k2, Object v2) {
        Map<String, Object> map = new HashMap<>();
        map.put(k1, v1);
        map.put(k2, v2);
        return map;
    }

    private Instant parseDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) return null;
        try {
            if (!dateStr.contains("T")) {
                dateStr = dateStr + "T00:00:00Z";
            } else if (dateStr.length() == 16) {
                dateStr = dateStr + ":00Z";
            } else if (dateStr.length() == 19) {
                dateStr = dateStr + "Z";
            }
            return Instant.parse(dateStr);
        } catch (Exception e) {
            try {
                return Instant.parse(dateStr);
            } catch (Exception ex) {
                return null;
            }
        }
    }

    // Validation helper
    private String validateEvent(Event event) {
        if (event.getTitle() == null || event.getTitle().trim().isEmpty()) {
            return "Title is required.";
        }
        if (event.getDescription() == null || event.getDescription().trim().isEmpty()) {
            return "Description is required.";
        }
        if (event.getStartDate() == null || event.getStartDate().isEmpty()) {
            return "Start date is required.";
        }
        if (event.getEndDate() == null || event.getEndDate().isEmpty()) {
            return "End date is required.";
        }
        if (event.getRegistrationDeadline() == null || event.getRegistrationDeadline().isEmpty()) {
            return "Registration deadline is required.";
        }
        if (event.getMaximumCapacity() <= 0) {
            return "Maximum capacity must be greater than 0.";
        }
        if (event.getMode() == null || event.getMode().trim().isEmpty()) {
            return "Event mode is required.";
        }

        Instant start = parseDate(event.getStartDate());
        Instant end = parseDate(event.getEndDate());
        Instant deadline = parseDate(event.getRegistrationDeadline());

        if (start == null) return "Invalid Start Date format.";
        if (end == null) return "Invalid End Date format.";
        if (deadline == null) return "Invalid Registration Deadline format.";

        if (start.isAfter(end)) {
            return "Start date must be before end date.";
        }
        if (deadline.isAfter(start)) {
            return "Registration deadline must be before the event start date.";
        }

        return null;
    }

    // POST /api/events - Create Event
    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody Event event, @RequestParam(required = false) String userId) {
        String validationError = validateEvent(event);
        if (validationError != null) {
            return ResponseEntity.badRequest().body(mapOf("error", validationError));
        }

        if (event.getStatus() == null || event.getStatus().isEmpty()) {
            event.setStatus("DRAFT");
        }
        
        event.setCreatedAt(Instant.now().toString());
        event.setUpdatedAt(Instant.now().toString());
        event.setCreatedBy(userId != null ? userId : "admin");
        event.setCurrentRegistrations(0);

        // Fallback banner image if not provided
        if (event.getBannerImage() == null || event.getBannerImage().trim().isEmpty()) {
            event.setBannerImage("https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop");
        }

        Event saved = eventRepository.save(event);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // PUT /api/events/{id} - Update Event
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable String id, @RequestBody Event event) {
        Optional<Event> existingOpt = eventRepository.findById(id);
        if (!existingOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        String validationError = validateEvent(event);
        if (validationError != null) {
            return ResponseEntity.badRequest().body(mapOf("error", validationError));
        }

        Event existing = existingOpt.get();
        existing.setTitle(event.getTitle());
        existing.setDescription(event.getDescription());
        existing.setBannerImage(event.getBannerImage() != null && !event.getBannerImage().trim().isEmpty() ? 
                event.getBannerImage() : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop");
        existing.setCategory(event.getCategory());
        existing.setDepartment(event.getDepartment());
        existing.setOrganizer(event.getOrganizer());
        existing.setVenue(event.getVenue());
        existing.setLocation(event.getLocation());
        existing.setStartDate(event.getStartDate());
        existing.setEndDate(event.getEndDate());
        existing.setRegistrationDeadline(event.getRegistrationDeadline());
        existing.setMaximumCapacity(event.getMaximumCapacity());
        existing.setEligibility(event.getEligibility());
        existing.setBatchRestrictions(event.getBatchRestrictions());
        existing.setCourseRestrictions(event.getCourseRestrictions());
        existing.setMode(event.getMode());
        existing.setMeetingLink(event.getMeetingLink());
        existing.setStatus(event.getStatus());
        existing.setUpdatedAt(Instant.now().toString());

        Event saved = eventRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    // DELETE /api/events/{id} - Delete Event
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable String id) {
        if (!eventRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        eventRepository.deleteById(id);
        // Also delete registrations for this event
        List<EventRegistration> registrations = eventRegistrationRepository.findByEventId(id);
        eventRegistrationRepository.deleteAll(registrations);
        return ResponseEntity.ok(mapOf("message", "Event and all its registrations deleted successfully."));
    }

    // POST /api/events/{id}/publish - Publish Event
    @PostMapping("/{id}/publish")
    public ResponseEntity<?> publishEvent(@PathVariable String id) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        if (!eventOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Event event = eventOpt.get();
        event.setStatus("PUBLISHED");
        event.setUpdatedAt(Instant.now().toString());
        Event saved = eventRepository.save(event);
        return ResponseEntity.ok(saved);
    }

    // POST /api/events/{id}/close - Close Event Registrations
    @PostMapping("/{id}/close")
    public ResponseEntity<?> closeEvent(@PathVariable String id) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        if (!eventOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Event event = eventOpt.get();
        event.setStatus("CLOSED");
        event.setUpdatedAt(Instant.now().toString());
        Event saved = eventRepository.save(event);
        return ResponseEntity.ok(saved);
    }

    // GET /api/events/{id} - Get Event by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getEventById(@PathVariable String id) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        return eventOpt.isPresent() ? ResponseEntity.ok(eventOpt.get()) : ResponseEntity.notFound().build();
    }

    // GET /api/events - Get events dynamically based on search, filter, and user eligibility
    @GetMapping
    public List<Event> getEvents(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String mode,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String timeFilter, // upcoming, completed
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String batch,
            @RequestParam(required = false) Boolean seatsAvailable) {

        List<Event> allEvents = eventRepository.findAll();
        Instant now = Instant.now();

        return allEvents.stream().filter(e -> {
            // Role level filter: Learners and Teachers can only see Published, Closed, or Cancelled (not Draft)
            if (role != null && (role.equalsIgnoreCase("learner") || role.equalsIgnoreCase("teacher"))) {
                if (e.getStatus() == null || e.getStatus().equalsIgnoreCase("DRAFT")) {
                    return false;
                }
                
                // Batch restrictions for Learners
                if (role.equalsIgnoreCase("learner") && batch != null && !batch.isEmpty()) {
                    if (e.getBatchRestrictions() != null && !e.getBatchRestrictions().isEmpty()) {
                        boolean batchAllowed = e.getBatchRestrictions().stream()
                                .anyMatch(b -> b != null && b.trim().equalsIgnoreCase(batch.trim()));
                        if (!batchAllowed) return false;
                    }
                }
            }

            // Category filter
            if (category != null && !category.isEmpty() && !category.equalsIgnoreCase("All")) {
                if (e.getCategory() == null || !e.getCategory().equalsIgnoreCase(category)) {
                    return false;
                }
            }

            // Department filter
            if (department != null && !department.isEmpty() && !department.equalsIgnoreCase("All")) {
                if (e.getDepartment() == null || !e.getDepartment().equalsIgnoreCase(department)) {
                    return false;
                }
            }

            // Mode filter
            if (mode != null && !mode.isEmpty() && !mode.equalsIgnoreCase("All")) {
                if (e.getMode() == null || !e.getMode().equalsIgnoreCase(mode)) {
                    return false;
                }
            }

            // Status filter
            if (status != null && !status.isEmpty() && !status.equalsIgnoreCase("All")) {
                if (e.getStatus() == null || !e.getStatus().equalsIgnoreCase(status)) {
                    return false;
                }
            }

            // Time filter (upcoming vs completed)
            if (timeFilter != null && !timeFilter.isEmpty()) {
                Instant start = parseDate(e.getStartDate());
                Instant end = parseDate(e.getEndDate());
                if (timeFilter.equalsIgnoreCase("upcoming")) {
                    if (start == null || start.isBefore(now)) return false;
                } else if (timeFilter.equalsIgnoreCase("completed")) {
                    if (end == null || end.isAfter(now)) return false;
                }
            }

            // Seats available filter
            if (seatsAvailable != null && seatsAvailable) {
                if (e.getCurrentRegistrations() >= e.getMaximumCapacity()) {
                    return false;
                }
            }

            // Search filter (title, department, location)
            if (search != null && !search.trim().isEmpty()) {
                String query = search.toLowerCase();
                boolean matchTitle = e.getTitle() != null && e.getTitle().toLowerCase().contains(query);
                boolean matchDept = e.getDepartment() != null && e.getDepartment().toLowerCase().contains(query);
                boolean matchLoc = e.getLocation() != null && e.getLocation().toLowerCase().contains(query);
                if (!matchTitle && !matchDept && !matchLoc) {
                    return false;
                }
            }

            return true;
        }).sorted(Comparator.comparing(Event::getStartDate, Comparator.nullsLast(Comparator.naturalOrder())))
          .collect(Collectors.toList());
    }

    // GET /api/events/admin - Return all events for admin dashboard
    @GetMapping("/admin")
    public List<Event> getAdminEvents() {
        return eventRepository.findAll().stream()
                .sorted(Comparator.comparing(Event::getStartDate, Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());
    }

    // GET /api/events/upcoming - Get upcoming events
    @GetMapping("/upcoming")
    public List<Event> getUpcomingEvents() {
        Instant now = Instant.now();
        return eventRepository.findAll().stream().filter(e -> {
            if ("DRAFT".equalsIgnoreCase(e.getStatus())) return false;
            Instant start = parseDate(e.getStartDate());
            return start != null && start.isAfter(now);
        }).sorted(Comparator.comparing(Event::getStartDate))
          .collect(Collectors.toList());
    }

    // GET /api/events/history - Get past events
    @GetMapping("/history")
    public List<Event> getPastEvents() {
        Instant now = Instant.now();
        return eventRepository.findAll().stream().filter(e -> {
            if ("DRAFT".equalsIgnoreCase(e.getStatus())) return false;
            Instant end = parseDate(e.getEndDate());
            return end != null && end.isBefore(now);
        }).sorted(Comparator.comparing(Event::getStartDate, Comparator.reverseOrder()))
          .collect(Collectors.toList());
    }

    // POST /api/events/{id}/register - Register learner for event
    @PostMapping("/{id}/register")
    public ResponseEntity<?> registerForEvent(@PathVariable String id, @RequestParam String userId) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        if (!eventOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Event event = eventOpt.get();

        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            return ResponseEntity.badRequest().body(mapOf("error", "User not found."));
        }
        User user = userOpt.get();

        // 1. Verify event is PUBLISHED
        if (!"PUBLISHED".equalsIgnoreCase(event.getStatus())) {
            return ResponseEntity.badRequest().body(mapOf("error", "Registration is not open for this event."));
        }

        // 2. Check if already registered
        Optional<EventRegistration> existingReg = eventRegistrationRepository.findByEventIdAndLearnerId(id, userId);
        if (existingReg.isPresent() && "REGISTERED".equalsIgnoreCase(existingReg.get().getStatus())) {
            return ResponseEntity.badRequest().body(mapOf("error", "You are already registered for this event."));
        }

        // 3. Capacity check
        if (event.getCurrentRegistrations() >= event.getMaximumCapacity()) {
            return ResponseEntity.badRequest().body(mapOf("error", "This event is at maximum capacity."));
        }

        // 4. Registration deadline check
        Instant deadline = parseDate(event.getRegistrationDeadline());
        if (deadline != null && Instant.now().isAfter(deadline)) {
            return ResponseEntity.badRequest().body(mapOf("error", "The registration deadline has passed."));
        }

        // 5. Batch restrictions check for learner
        if ("learner".equalsIgnoreCase(user.getRole())) {
            if (event.getBatchRestrictions() != null && !event.getBatchRestrictions().isEmpty()) {
                boolean batchAllowed = event.getBatchRestrictions().stream()
                        .anyMatch(b -> b != null && b.trim().equalsIgnoreCase(user.getBatch().trim()));
                if (!batchAllowed) {
                    return ResponseEntity.badRequest().body(mapOf("error", "Your batch (" + user.getBatch() + ") is not eligible for this event."));
                }
            }
        }

        // Create or update registration
        EventRegistration registration;
        if (existingReg.isPresent()) {
            registration = existingReg.get();
            registration.setStatus("REGISTERED");
            registration.setRegistrationTime(Instant.now().toString());
        } else {
            registration = new EventRegistration();
            registration.setEventId(id);
            registration.setLearnerId(userId);
            registration.setStatus("REGISTERED");
            registration.setRegistrationTime(Instant.now().toString());
        }

        eventRegistrationRepository.save(registration);

        // Update current registrations count
        long activeCount = eventRegistrationRepository.findByEventIdAndStatus(id, "REGISTERED").size();
        event.setCurrentRegistrations((int) activeCount);
        eventRepository.save(event);

        return ResponseEntity.ok(mapOf("message", "Registered successfully!", "event", event));
    }

    // DELETE /api/events/{id}/register - Cancel registration
    @DeleteMapping("/{id}/register")
    public ResponseEntity<?> cancelRegistration(@PathVariable String id, @RequestParam String userId) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        if (!eventOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Event event = eventOpt.get();

        Optional<EventRegistration> existingReg = eventRegistrationRepository.findByEventIdAndLearnerId(id, userId);
        if (!existingReg.isPresent() || !"REGISTERED".equalsIgnoreCase(existingReg.get().getStatus())) {
            return ResponseEntity.badRequest().body(mapOf("error", "No active registration found."));
        }

        // Check if registration deadline has passed (cancellation must be before deadline)
        Instant deadline = parseDate(event.getRegistrationDeadline());
        if (deadline != null && Instant.now().isAfter(deadline)) {
            return ResponseEntity.badRequest().body(mapOf("error", "You cannot cancel registration after the deadline."));
        }

        EventRegistration registration = existingReg.get();
        registration.setStatus("CANCELLED");
        eventRegistrationRepository.save(registration);

        // Update count
        long activeCount = eventRegistrationRepository.findByEventIdAndStatus(id, "REGISTERED").size();
        event.setCurrentRegistrations((int) activeCount);
        eventRepository.save(event);

        return ResponseEntity.ok(mapOf("message", "Registration cancelled successfully.", "event", event));
    }

    // GET /api/events/{id}/registrations - Get registered students for an event (with User details)
    @GetMapping("/{id}/registrations")
    public List<EventRegistrationResponse> getEventRegistrations(@PathVariable String id) {
        List<EventRegistration> registrations = eventRegistrationRepository.findByEventId(id);
        
        List<EventRegistrationResponse> responseList = new ArrayList<>();
        for (EventRegistration reg : registrations) {
            Optional<User> userOpt = userRepository.findById(reg.getLearnerId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                responseList.add(new EventRegistrationResponse(
                        reg.getId(),
                        reg.getEventId(),
                        reg.getLearnerId(),
                        user.getName(),
                        user.getEmail(),
                        user.getBatch(),
                        user.getRollNumber(),
                        reg.getRegistrationTime(),
                        reg.getStatus()
                ));
            }
        }
        return responseList;
    }

    // GET /api/events/my - Get events current learner has registered for
    @GetMapping("/my")
    public List<Event> getMyRegisteredEvents(@RequestParam String userId) {
        List<EventRegistration> myRegs = eventRegistrationRepository.findByLearnerId(userId).stream()
                .filter(reg -> "REGISTERED".equalsIgnoreCase(reg.getStatus()))
                .collect(Collectors.toList());

        List<Event> myEvents = new ArrayList<>();
        for (EventRegistration reg : myRegs) {
            Optional<Event> eventOpt = eventRepository.findById(reg.getEventId());
            eventOpt.ifPresent(myEvents::add);
        }
        return myEvents.stream()
                .sorted(Comparator.comparing(Event::getStartDate, Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());
    }
}
