
package ch.diethelm.backend.service;

public class TitleNormalizer {

    public static String normalize(String raw) {

        if (raw == null) {
            throw new IllegalArgumentException("Titel darf nicht null sein");
        }

        String title = raw.trim().replaceAll("\\s+", " ");

        if (title.isEmpty()) {
            throw new IllegalArgumentException("Titel darf nicht leer sein");
        }
        return Character.toUpperCase(title.charAt(0))
                + title.substring(1);
    }
}
